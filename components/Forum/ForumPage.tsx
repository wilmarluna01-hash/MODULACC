import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { APP_NAME } from '../../constants';
import { AccessibleButton } from '../Shared/AccessibleButton';
import { LoadingSpinner } from '../Shared/LoadingSpinner';
import { toast } from '../Shared/Toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Reply {
  authorId: string;
  authorName: string;
  content: string;
  createdAt: any;
}

interface ForumPost {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: string;
  createdAt: any;
  replies?: Reply[];
}

export const ForumPage: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'forum_posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ForumPost[];
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching forum posts:", error);
      toast.error("No se pudieron cargar las publicaciones del foro.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error("Por favor completa el título y el contenido.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'forum_posts'), {
        authorId: auth.currentUser?.uid,
        authorName: auth.currentUser?.displayName || 'Usuario',
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        createdAt: serverTimestamp(),
        replies: []
      });
      setNewPost({ title: '', content: '', category: 'General' });
      setShowNewPostForm(false);
      toast.success("¡Publicación creada con éxito!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Hubo un error al crear la publicación.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (postId: string) => {
    const text = replyText[postId];
    if (!text || !text.trim()) return;

    try {
      const postRef = doc(db, 'forum_posts', postId);
      await updateDoc(postRef, {
        replies: arrayUnion({
          authorId: auth.currentUser?.uid,
          authorName: auth.currentUser?.displayName || 'Usuario',
          content: text,
          createdAt: new Date().toISOString() // Using ISO string for simplicity in replies
        })
      });
      setReplyText(prev => ({ ...prev, [postId]: '' }));
      toast.success("Respuesta enviada.");
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("No se pudo enviar la respuesta.");
    }
  };

  const categories = ["General", "Ciencias", "Historia", "Matemáticas", "Tecnología"];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-slate-600 font-medium">Cargando foro de la comunidad...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Foro de Consultas</h1>
          <p className="text-slate-500 text-lg">Comparte tus dudas y ayuda a otros compañeros de {APP_NAME}.</p>
        </div>
        <AccessibleButton 
          onClick={() => setShowNewPostForm(!showNewPostForm)}
          variant="primary"
          className="rounded-2xl px-8 py-3 shadow-lg shadow-primary/20"
          iconLeft={<i className={`fas ${showNewPostForm ? 'fa-times' : 'fa-plus'}`}></i>}
        >
          {showNewPostForm ? 'Cancelar' : 'Nueva Consulta'}
        </AccessibleButton>
      </header>

      <AnimatePresence>
        {showNewPostForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-12"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Crear Nueva Publicación</h2>
            <form onSubmit={handleCreatePost} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="post-title" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Título de la consulta</label>
                  <input 
                    id="post-title"
                    type="text" 
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="Ej: Duda sobre fotosíntesis"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="post-category" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Categoría</label>
                  <select 
                    id="post-category"
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="post-content" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Contenido de tu duda</label>
                <textarea 
                  id="post-content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all min-h-[150px]"
                  placeholder="Explica tu duda con detalle..."
                  required
                />
              </div>
              <div className="flex justify-end">
                <AccessibleButton 
                  type="submit" 
                  variant="primary" 
                  className="rounded-xl px-10 py-3"
                  disabled={submitting}
                >
                  {submitting ? <LoadingSpinner size="sm" /> : 'Publicar Consulta'}
                </AccessibleButton>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-300">
            <i className="fas fa-comments text-5xl text-slate-300 mb-4"></i>
            <p className="text-slate-500 text-lg">Aún no hay publicaciones. ¡Sé el primero en preguntar!</p>
          </div>
        ) : (
          posts.map(post => (
            <motion.article 
              key={post.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-widest">
                    {post.category}
                  </span>
                  <span className="text-slate-400 text-sm">
                    {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Reciente'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{post.title}</h2>
                <p className="text-slate-600 leading-relaxed mb-6 whitespace-pre-wrap">{post.content}</p>
                <div className="flex items-center gap-3 text-slate-500 text-sm">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                    <i className="fas fa-user text-xs"></i>
                  </div>
                  <span className="font-bold text-slate-700">{post.authorName}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-8 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Respuestas ({post.replies?.length || 0})</h3>
                
                <div className="space-y-6 mb-8">
                  {post.replies?.map((reply, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-primary text-sm">{reply.authorName}</span>
                        <span className="text-slate-400 text-xs">
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm">{reply.content}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={replyText[post.id] || ''}
                    onChange={(e) => setReplyText({ ...replyText, [post.id]: e.target.value })}
                    className="flex-grow px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                    placeholder="Escribe una respuesta..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddReply(post.id)}
                  />
                  <AccessibleButton 
                    onClick={() => handleAddReply(post.id)}
                    variant="secondary"
                    className="rounded-2xl px-6"
                  >
                    Responder
                  </AccessibleButton>
                </div>
              </div>
            </motion.article>
          ))
        )}
      </div>
    </div>
  );
};
