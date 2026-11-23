import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { usePost } from '../hooks/usePost';
import PostCard from '../components/PostCard';
import { Loader2, Camera } from 'lucide-react';

const Home = () => {
  const { handleGetPosts } = usePost();
  const { posts, loading, error } = useSelector((state) => state.posts);

  useEffect(() => {
    handleGetPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pt-4 sm:pt-8 px-0 sm:px-4 max-w-[680px] mx-auto w-full">
      {/* Mobile Header (Hidden on Desktop) */}
      <header className="flex items-center justify-between mb-6 px-4 sm:hidden">
        <h1 className="text-2xl font-bold tracking-tight text-[#1877f2]">Bestgram</h1>
      </header>
      
      {loading ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-20 px-4">
          <p className="text-red-400 mb-4 font-medium tracking-wide">Failed to load posts.</p>
          <button 
            onClick={() => handleGetPosts()} 
            className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-sm font-semibold transition-all shadow-md cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="space-y-3 sm:space-y-5">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-xl border border-[#dddfe2] mx-4 sm:mx-0 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-[#eaf3ff] flex items-center justify-center mx-auto mb-6 shadow-inner border border-[#d7e8ff]">
            <Camera className="w-8 h-8 text-[#1877f2]" />
          </div>
          <h3 className="text-xl font-semibold text-[#1c1e21] mb-2">No Posts Yet</h3>
          <p className="text-[#65676b] text-sm max-w-50 mx-auto leading-relaxed">
            Follow people or create a post to see photos and videos here.
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
