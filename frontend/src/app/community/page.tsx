"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Heart, Image, Video, Mic, FileText, Plus, Send, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { communityAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const TYPES = [{id:'all',label:'All',icon:<FileText size={16}/>},{id:'text',label:'Stories',icon:<FileText size={16}/>},{id:'photo',label:'Photos',icon:<Image size={16}/>},{id:'video',label:'Videos',icon:<Video size={16}/>},{id:'audio',label:'Audio',icon:<Mic size={16}/>}];

export default function CommunityPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [showNew, setShowNew] = useState(false);
  const [newPost, setNewPost] = useState({type:'text',title:'',body:'',mediaUrl:''});
  const [commentText, setCommentText] = useState<Record<string,string>>({});
  const [expandedPost, setExpandedPost] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPosts(); }, [filter]);

  const loadPosts = async () => {
    setLoading(true);
    try { const res = await communityAPI.getPosts(filter); setPosts(res.data.data||[]); } catch(e){console.error(e)}
    finally { setLoading(false); }
  };

  const createPost = async () => {
    if(!newPost.title) return;
    try { await communityAPI.createPost(newPost); setShowNew(false); setNewPost({type:'text',title:'',body:'',mediaUrl:''}); loadPosts(); } catch(e){console.error(e)}
  };

  const likePost = async (id:string) => {
    try { await communityAPI.likePost(id); loadPosts(); } catch(e){console.error(e)}
  };

  const addComment = async (postId:string) => {
    const body = commentText[postId];
    if(!body) return;
    try { await communityAPI.addComment(postId, body); setCommentText({...commentText,[postId]:''}); loadPosts(); } catch(e){console.error(e)}
  };

  return (
    <div className="min-h-screen p-6 pt-32 text-slate-800 bg-travel-gradient">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-bold font-outfit tracking-tight">🌍 Community</h1><p className="text-slate-500 text-sm font-medium">Connect with fellow world travelers</p></div>
          <button onClick={()=>setShowNew(true)} className="flex items-center gap-2 px-6 py-3 bg-[#63D5DF] text-white font-bold rounded-2xl text-sm shadow-xl hover:scale-105 transition-all"><Plus size={18}/> Share Story</button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">{TYPES.map(t=><button key={t.id} onClick={()=>setFilter(t.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm whitespace-nowrap transition-all ${filter===t.id?'bg-white shadow-md text-[#63D5DF]':'bg-white/30 text-slate-600 hover:bg-white/50'}`}>{t.icon}{t.label}</button>)}</div>

        <div className="space-y-6">
          {posts.map((p:any) => (
            <motion.div key={p.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="glass-panel p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#63D5DF] to-[#F3E2D2] flex items-center justify-center text-white text-sm font-bold">{p.user?.name?.charAt(0)||'?'}</div>
                <div><div className="font-bold text-sm">{p.user?.name||'Anonymous'}</div><div className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()} • {p.type}</div></div>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${p.type==='photo'?'bg-blue-100 text-blue-600':p.type==='video'?'bg-purple-100 text-purple-600':p.type==='audio'?'bg-amber-100 text-amber-600':'bg-gray-100 text-gray-600'}`}>{p.type}</span>
              </div>
              <h3 className="font-bold text-lg mb-2">{p.title}</h3>
              {p.body && <p className="text-gray-600 mb-4 whitespace-pre-wrap">{p.body}</p>}
              {p.mediaUrl && p.type==='photo' && <div className="rounded-2xl overflow-hidden mb-4 bg-gray-100"><img src={p.mediaUrl} alt={p.title} className="w-full h-64 object-cover"/></div>}
              {p.mediaUrl && p.type==='video' && <video src={p.mediaUrl} controls className="w-full rounded-2xl mb-4"/>}
              {p.mediaUrl && p.type==='audio' && <audio src={p.mediaUrl} controls className="w-full mb-4"/>}

              <div className="flex items-center gap-4 pt-3 border-t border-white/30">
                <button onClick={()=>likePost(p.id)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-rose-500 transition-colors font-semibold"><Heart size={16}/>{p.likes}</button>
                <button onClick={()=>setExpandedPost(expandedPost===p.id?null:p.id)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-500 transition-colors font-semibold"><MessageCircle size={16}/>{p._count?.comments||0}</button>
              </div>

              {expandedPost===p.id && (
                <div className="mt-4 space-y-3 pt-3 border-t border-white/30">
                  {p.comments?.map((c:any)=>(
                    <div key={c.id} className="flex gap-3 items-start">
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">{c.user?.name?.charAt(0)||'?'}</div>
                      <div className="flex-1 bg-white/40 rounded-xl p-3"><span className="font-bold text-xs">{c.user?.name}</span><p className="text-sm text-gray-600 mt-0.5">{c.body}</p></div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input value={commentText[p.id]||''} onChange={e=>setCommentText({...commentText,[p.id]:e.target.value})} placeholder="Write a comment..." className="premium-input flex-1 text-sm" onKeyDown={e=>e.key==='Enter'&&addComment(p.id)}/>
                    <button onClick={()=>addComment(p.id)} className="w-10 h-10 bg-[#63D5DF] text-white rounded-xl flex items-center justify-center"><Send size={16}/></button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          {posts.length===0&&!loading&&<div className="glass-panel p-12 rounded-2xl text-center"><MessageCircle size={48} className="text-gray-300 mx-auto mb-4"/><h3 className="text-xl font-bold mb-2">No stories yet</h3><p className="text-gray-500">Be the first to share your travel experience!</p></div>}
        </div>
      </div>

      {showNew && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={()=>setShowNew(false)}>
          <motion.div initial={{scale:0.9}} animate={{scale:1}} className="glass-panel w-full max-w-lg p-8 rounded-[2rem]" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-bold">Share Your Story</h3><button onClick={()=>setShowNew(false)}><X size={20}/></button></div>
            <div className="space-y-4">
              <div className="flex gap-2">{['text','photo','video','audio'].map(t=><button key={t} onClick={()=>setNewPost({...newPost,type:t})} className={`px-4 py-2 rounded-xl text-sm font-bold capitalize ${newPost.type===t?'bg-[#63D5DF] text-white':'bg-white/40 text-gray-600'}`}>{t}</button>)}</div>
              <input value={newPost.title} onChange={e=>setNewPost({...newPost,title:e.target.value})} placeholder="Title..." className="premium-input"/>
              <textarea value={newPost.body} onChange={e=>setNewPost({...newPost,body:e.target.value})} placeholder="Share your experience..." rows={4} className="premium-input resize-none"/>
              {newPost.type!=='text'&&<input value={newPost.mediaUrl} onChange={e=>setNewPost({...newPost,mediaUrl:e.target.value})} placeholder={`Paste ${newPost.type} URL...`} className="premium-input"/>}
              <button onClick={createPost} className="premium-button w-full"><span className="relative z-10">Publish Story</span></button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
