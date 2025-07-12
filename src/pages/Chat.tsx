
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import UnifiedMascot from '@/components/UnifiedMascot';
import { Send, User, Search, Users } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  userId: string;
  username: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

const Chat = () => {
  const { user } = useAuth();
  const { userId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(userId || null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock conversations data
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        userId: 'user1',
        username: 'Sarah_Style',
        lastMessage: 'Hi! Is the vintage jacket still available?',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
        unreadCount: 2
      },
      {
        userId: 'user2', 
        username: 'FashionExplorer',
        lastMessage: 'Thanks for the swap! The dress is perfect.',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
        unreadCount: 0
      },
      {
        userId: 'user3',
        username: 'RetroVibes',
        lastMessage: 'When can we meet for the exchange?',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
        unreadCount: 1
      }
    ];
    setConversations(mockConversations);
  }, []);

  // Mock messages for selected conversation
  useEffect(() => {
    if (selectedUser) {
      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: selectedUser,
          receiverId: user?.id || '',
          content: 'Hi! I saw your listing for the vintage jacket. Is it still available?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          read: true
        },
        {
          id: '2',
          senderId: user?.id || '',
          receiverId: selectedUser,
          content: 'Yes, it\'s still available! Would you like to swap or rent it?',
          timestamp: new Date(Date.now() - 1000 * 60 * 45),
          read: true
        },
        {
          id: '3',
          senderId: selectedUser,
          receiverId: user?.id || '',
          content: 'I\'d love to swap! I have a similar style dress that might interest you.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          read: false
        }
      ];
      setMessages(mockMessages);
    }
  }, [selectedUser, user?.id]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || '',
      receiverId: selectedUser,
      content: newMessage,
      timestamp: new Date(),
      read: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update conversation list
    setConversations(prev => prev.map(conv => 
      conv.userId === selectedUser 
        ? { ...conv, lastMessage: newMessage, lastMessageTime: new Date(), unreadCount: 0 }
        : conv
    ));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredConversations = conversations.filter(conv =>
    conv.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations.find(conv => conv.userId === selectedUser);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          
          {/* Conversations List */}
          <Card className="lg:col-span-1 glass border-0">
            <CardHeader>
              <CardTitle className="gradient-text flex items-center gap-2">
                <Users className="w-5 h-5" />
                Messages
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.userId}
                    onClick={() => setSelectedUser(conversation.userId)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedUser === conversation.userId ? 'bg-purple-50 dark:bg-purple-900/20 border-r-4 border-purple-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{conversation.username[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{conversation.username}</p>
                          <p className="text-xs text-gray-500">{formatTime(conversation.lastMessageTime)}</p>
                        </div>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-purple-500 text-white text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 glass border-0 flex flex-col">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{selectedConversation?.username[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{selectedConversation?.username}</CardTitle>
                        <p className="text-sm text-gray-500">Active now</p>
                      </div>
                    </div>
                    <UnifiedMascot size="small" category="general" />
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === user?.id
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === user?.id ? 'text-purple-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} className="btn-animated bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* No conversation selected */
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <UnifiedMascot size="large" category="general" showText={true} textMessage="Select a conversation to start chatting! 💬" />
                <h3 className="text-xl font-semibold mt-4 mb-2">Welcome to ReWear Chat</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Connect with other fashion enthusiasts to discuss swaps, rentals, and style tips!
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;
