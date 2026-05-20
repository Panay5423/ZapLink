import { Component, EventEmitter, Output, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialService } from '../../../cors/services/social/social.service';
import { SocketService } from '../../../cors/services/socket/socket.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-chatbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.css']
})
export class ChatboxComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  searchQuery: string = '';

  activeChats: any[] = [];
  followers: any[] = [];
  filteredFollowers: any[] = [];
  currentUserId: string = '';

  // Controls the specific chat window
  selectedChat: any = null;
  selectedUser: any = null;

  messages: any[] = [];
  newMessageText: string = '';

  showEmojiPicker: boolean = false;
  commonEmojis: string[] = [
    '😀', '😂', '🤣', '😊', '😍', '😘', '😭', '😅', '🥺',
    '😎', '🤔', '😡', '🤬', '🤯', '🥳', '😴', '😇', '😈',
    '👍', '👎', '👏', '🙏', '❤️', '💔', '💯', '✨', '🔥'
  ];

  onlineUsers: Set<string> = new Set();
  isTyping: boolean = false;
  typingTimeout: any;

  constructor(
    private socialService: SocialService, 
    private socketService: SocketService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.extractUserId();
    this.loadActiveChats();
    this.setupSocketListener();
  }

  setupSocketListener() {
    const socket = this.socketService.getSocket();
    if (socket) {
      socket.emit("get_online_users");

      socket.on("online_users_list", (users: string[]) => {
        this.onlineUsers = new Set(users);
      });

      socket.on("user_online", (data: any) => {
        this.onlineUsers.add(data.userId);
      });

      socket.on("user_offline", (data: any) => {
        this.onlineUsers.delete(data.userId);
        this.cdr.detectChanges();
      });

      socket.on("typing", (data: any) => {
        if (this.selectedUser && data.senderId === this.selectedUser._id) {
          this.isTyping = true;
          this.scrollToBottom();
          this.cdr.detectChanges();
        }
      });

      socket.on("stop_typing", (data: any) => {
        if (this.selectedUser && data.senderId === this.selectedUser._id) {
          this.isTyping = false;
          this.cdr.detectChanges();
        }
      });

      socket.on('new_message', (msg: any) => {
        // If we are currently chatting with the sender
        if (this.selectedUser && msg.from === this.selectedUser._id) {
          this.messages.push(msg);
          this.isTyping = false; // Hide typing indicator when message arrives
          this.scrollToBottom();
          
          // Instantly mark as read since we are viewing the chat
          if (this.selectedChat && this.selectedChat._id) {
            this.socialService.markAsRead(this.selectedChat._id).subscribe();
          }
        }
        // Always refresh active chats to update unread count & last message
        this.loadActiveChats();
        this.cdr.detectChanges();
      });

      socket.on('message_deleted', (data: any) => {
        // Remove the deleted message from the UI in real-time
        this.messages = this.messages.filter(m => m._id !== data.messageId);
        this.cdr.detectChanges();
      });

      socket.on('messages_read', (data: any) => {
        // If the person we are chatting with just read our messages
        if (this.selectedUser && data.readerId === this.selectedUser._id) {
          this.messages.forEach(m => {
            if (m.from === this.currentUserId) {
              m.isRead = true;
            }
          });
          this.cdr.detectChanges();
        }
      });
    }
  }

  extractUserId() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserId = payload.id || payload._id;
      } catch (err) {
        console.error("Invalid token");
      }
    }
  }

  loadActiveChats() {
    this.socialService.getChatList().subscribe({
      next: (res: any) => {
        this.activeChats = res;
      },
      error: (err) => console.error("Error loading active chats:", err)
    });
  }

  onClose() {
    this.close.emit();
  }

  onSearch() {
    if (this.searchQuery.trim().length > 0) {
      this.socialService.getfollwers(this.searchQuery).subscribe({
        next: (res: any) => {
          this.followers = res;
          this.filteredFollowers = res;
        },
        error: (err) => {
          console.error("Search error:", err);
        }
      });
    } else {
      this.followers = [];
      this.filteredFollowers = [];
    }
  }

  getOtherMember(chat: any) {
    return chat.members.find((member: any) => member._id !== this.currentUserId) || chat.members[0];
  }

  getProfileUrl(user: any): string {
    if (!user) return 'https://ui-avatars.com/api/?name=User&background=random';
    const pic = user.profilePicture || user.avatar;
    if (pic) {
      if (pic.startsWith('http')) return pic;
      let hostUrl = environment.BaseAPiURL;
      if (hostUrl.endsWith('/api/')) hostUrl = hostUrl.replace('/api/', '');
      else if (hostUrl.endsWith('/api')) hostUrl = hostUrl.replace('/api', '');
      else if (hostUrl.endsWith('/')) hostUrl = hostUrl.slice(0, -1);

      let path = pic;
      if (!path.includes('uploads/')) {
        path = path.startsWith('/') ? `uploads${path}` : `uploads/${path}`;
      }
      path = path.startsWith('/') ? path : `/${path}`;
      return `${hostUrl}${path}`;
    }
    return `https://ui-avatars.com/api/?name=${user.username || user.name || 'User'}&background=random`;
  }

  openChatWindow(chat: any, otherUser: any) {
    this.selectedChat = chat;
    this.selectedUser = otherUser;
    this.messages = []; // Clear existing messages
    this.loadMessages();

    // Mark as read whenever opening the chat (if a chat exists)
    if (this.selectedChat && this.selectedChat._id) {
      this.socialService.markAsRead(this.selectedChat._id).subscribe({
        next: () => {
          this.selectedChat.unreadCount = 0;
          this.loadActiveChats(); // Reload to clear badge in the list
        },
        error: (err) => console.error("Error marking chat as read:", err)
      });
    }
  }

  loadMessages() {
    if (!this.selectedUser) return;
    this.socialService.getMessages(this.selectedUser._id).subscribe({
      next: (msgs: any) => {
        this.messages = msgs;
        this.scrollToBottom();
      },
      error: (err) => console.error("Error loading messages:", err)
    });
  }

  sendMessage() {
    if (!this.newMessageText.trim() || !this.selectedUser) return;

    const text = this.newMessageText.trim();
    this.newMessageText = ''; // Clear input immediately for better UX
    this.showEmojiPicker = false; // Hide emoji picker on send
    
    // Stop typing indicator instantly
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    const socket = this.socketService.getSocket();
    if (socket) socket.emit("stop_typing", { senderId: this.currentUserId, receiverId: this.selectedUser._id });

    this.socialService.sendMessage(this.selectedUser._id, text).subscribe({
      next: (msg: any) => {
        this.messages.push(msg);
        this.scrollToBottom();
      },
      error: (err) => {
        console.error("Error sending message:", err);
      }
    });
  }

  triggerImageUpload() {
    const fileInput = document.getElementById('chatImageUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file && this.selectedUser) {
      this.socialService.sendImageMessage(this.selectedUser._id, file).subscribe({
        next: (msg: any) => {
          this.messages.push(msg);
          this.scrollToBottom();
        },
        error: (err) => {
          console.error("Error sending image:", err);
        }
      });
    }
    // Clear input so same file can be uploaded again if needed
    event.target.value = '';
  }

  onInputTyping() {
    const socket = this.socketService.getSocket();
    if (socket && this.selectedUser) {
      socket.emit("typing", { senderId: this.currentUserId, receiverId: this.selectedUser._id });

      if (this.typingTimeout) clearTimeout(this.typingTimeout);

      this.typingTimeout = setTimeout(() => {
        socket.emit("stop_typing", { senderId: this.currentUserId, receiverId: this.selectedUser._id });
      }, 2000);
    }
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(emoji: string) {
    this.newMessageText += emoji;
  }

  deleteMessage(messageId: string) {
    // Optimistically remove from UI
    this.messages = this.messages.filter(m => m._id !== messageId);
    
    // Call backend to delete
    this.socialService.deleteMessage(messageId).subscribe({
      next: () => console.log('Message deleted'),
      error: (err) => console.error("Error deleting message:", err)
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  closeChatWindow() {
    this.selectedChat = null;
    this.selectedUser = null;
    this.messages = [];
    this.loadActiveChats(); // Reload chats when going back to list
  }

  getImageUrl(path: string) {
    if (!path) return '';
    return `${environment.BaseAPiURL}${path}`;
  }
}
