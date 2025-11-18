"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
  image?: string;
}

interface Comment {
  id: number;
  user_name: string;
  content: string;
  created_at: string;
}

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  // Загрузка постов из БД
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:4500/api/posts");
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Ошибка загрузки постов:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostComments = async (postId: number) => {
    try {
      const response = await fetch(`http://localhost:4500/api/posts/${postId}/comments`);
      const data = await response.json();
      if (data.success) {
        setPostComments(data.comments);
      }
    } catch (error) {
      console.error("Ошибка загрузки комментариев:", error);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const response = await fetch(`http://localhost:4500/api/posts/${postId}/like`, {
        method: "POST",
      });
      const data = await response.json();
      
      if (data.success) {
        // Обновляем локальное состояние
        setPosts(posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes_count: data.likes_count,
                user_has_liked: data.user_has_liked 
              }
            : post
        ));
        
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost({
            ...selectedPost,
            likes_count: data.likes_count,
            user_has_liked: data.user_has_liked
          });
        }
      }
    } catch (error) {
      console.error("Ошибка лайка:", error);
    }
  };

  const handleAddComment = async (postId: number) => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`http://localhost:4500/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await response.json();

      if (data.success) {
        setNewComment("");
        // Обновляем комментарии
        await fetchPostComments(postId);
        // Обновляем счетчик комментариев в списке постов
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, comments_count: post.comments_count + 1 }
            : post
        ));
        
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost({
            ...selectedPost,
            comments_count: selectedPost.comments_count + 1
          });
        }
      }
    } catch (error) {
      console.error("Ошибка добавления комментария:", error);
    }
  };

  const openPostDetails = async (post: Post) => {
    setSelectedPost(post);
    await fetchPostComments(post.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Загрузка новостей...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Хлебные крошки */}
        <nav className="mb-8">
          <Link 
            href="/" 
            className="text-amber-700 hover:text-amber-800 transition-colors font-medium"
          >
            Главная
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600 font-medium">Новости</span>
        </nav>

        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Новости кофейни</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto font-medium">
            Будьте в курсе последних событий, акций и новинок нашей кофейни
          </p>
        </div>

        {/* Сетка постов */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 font-medium">
                      <span>Автор: {post.author}</span>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed font-medium">
                  {post.content}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 transition-colors ${
                        post.user_has_liked 
                          ? "text-amber-600" 
                          : "text-gray-500 hover:text-amber-600"
                      }`}
                    >
                      <span className="text-xl">{post.user_has_liked ? "❤️" : "🤍"}</span>
                      <span className="font-semibold">{post.likes_count}</span>
                    </button>

                    <button
                      onClick={() => openPostDetails(post)}
                      className="flex items-center space-x-2 text-gray-500 hover:text-amber-600 transition-colors"
                    >
                      <span className="text-xl">💬</span>
                      <span className="font-semibold">{post.comments_count}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => openPostDetails(post)}
                    className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-6 rounded-lg transition-colors font-medium"
                  >
                    Читать далее
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Модальное окно с деталями поста */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">{selectedPost.title}</h2>
                    <div className="flex items-center space-x-4 text-gray-500 font-medium">
                      <span>Автор: {selectedPost.author}</span>
                      <span>{formatDate(selectedPost.created_at)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="prose max-w-none mb-8">
                  <p className="text-gray-700 leading-relaxed font-medium text-lg">
                    {selectedPost.content}
                  </p>
                </div>

                {/* Действия с постом */}
                <div className="flex items-center space-x-6 mb-8 pb-6 border-b border-gray-200">
                  <button
                    onClick={() => handleLike(selectedPost.id)}
                    className={`flex items-center space-x-2 transition-colors ${
                      selectedPost.user_has_liked 
                        ? "text-amber-600" 
                        : "text-gray-500 hover:text-amber-600"
                    }`}
                  >
                    <span className="text-xl">{selectedPost.user_has_liked ? "❤️" : "🤍"}</span>
                    <span className="font-semibold">{selectedPost.likes_count} лайков</span>
                  </button>

                  <div className="flex items-center space-x-2 text-gray-500">
                    <span className="text-xl">💬</span>
                    <span className="font-semibold">{selectedPost.comments_count} комментариев</span>
                  </div>
                </div>

                {/* Форма добавления комментария */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Оставить комментарий</h3>
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Напишите ваш комментарий..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
                    />
                    <button
                      onClick={() => handleAddComment(selectedPost.id)}
                      disabled={!newComment.trim()}
                      className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg transition-colors font-medium"
                    >
                      Отправить
                    </button>
                  </div>
                </div>

                {/* Список комментариев */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Комментарии ({postComments.length})
                  </h3>
                  
                  {postComments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 font-medium">
                      Пока нет комментариев. Будьте первым!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {postComments.map((comment) => (
                        <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-gray-900">{comment.user_name}</span>
                            <span className="text-gray-500 text-sm font-medium">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 font-medium">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}