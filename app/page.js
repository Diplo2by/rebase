'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas-pro'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import Image from 'next/image';
import { Icons } from './assets/Icons';
import StatBox from './components/StatBox';
import CustomTooltip from './components/CustomTooltip';

const CHART_COLORS = ['#58a6ff', '#3fb950', '#d2a8ff', '#ffa657', '#ff7b72'];

export default function Home() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const recapRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/github-recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to fetch data');
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!data || !recapRef.current) return;
    try {
      const canvas = await html2canvas(recapRef.current, {
        backgroundColor: '#0d1117',
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = imgData;
      link.download = `${data.user.username}-rebase-2025.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export image', err);
      alert('Could not export image. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-[#0d1117] text-white selection:bg-[#58a6ff] selection:text-[#0d1117] relative overflow-hidden font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#58a6ff] rounded-full mix-blend-screen filter blur-[128px] opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#bc8cff] rounded-full mix-blend-screen filter blur-[128px] opacity-10"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="relative z-10">
        {!data && (
          <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <div className="text-center mb-12 space-y-4">
              <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-[#58a6ff] uppercase bg-[#58a6ff]/10 border border-[#58a6ff]/20 rounded-full">
                2025 Edition
              </div>
              <h1 className="text-7xl md:text-8xl font-extrabold tracking-tighter">
                <span className="text-transparent bg-clip-text bg-linear-to-br from-white via-[#c9d1d9] to-[#8b949e]">
                  Rebase
                </span>
                <span className="text-[#58a6ff]">.</span>
              </h1>
              <p className="text-xl text-[#8b949e] max-w-lg mx-auto leading-relaxed">
                Decoding your year on GitHub.
              </p>
            </div>

            <div className="w-full max-w-md">
              <form onSubmit={handleSubmit} className="space-y-4 group">
                <div className="relative transition-all duration-300 focus-within:scale-[1.02]">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8b949e]">
                    <Icons.Search />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="GitHub username"
                    className="w-full pl-12 pr-6 py-5 bg-[#161b22]/80 backdrop-blur-sm border border-[#30363d] rounded-2xl text-lg text-white placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all shadow-xl"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-[#238636] hover:bg-[#2ea043] rounded-2xl text-xl font-bold text-white shadow-lg shadow-[#238636]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Icons.Spinner />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    'Generate your recap'
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-6 p-4 bg-[#da3633]/10 border border-[#da3633]/30 rounded-xl flex items-center gap-3 text-[#f85149] animate-in fade-in slide-in-from-top-2">
                  <Icons.AlertCircle />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {data && (
          <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-8 animate-in fade-in zoom-in-95 duration-500" ref={recapRef}>
            {/* Top bar */}
            <div className="flex lg-flex-col lg-gap-3 md:flex-row md:items-center md:justify-between">
              <button
                onClick={() => setData(null)}
                className="group flex items-center gap-2 text-[#8b949e] hover:text-[#58a6ff] transition-colors py-2 px-4 rounded-lg hover:bg-[#58a6ff]/10 w-fit"
              >
                <span className="group-hover:-translate-x-1 transition-transform">
                  <Icons.ArrowLeft />
                </span>
                <span className="font-medium">Search another</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 py-2 px-4 rounded-lg bg-[#58a6ff]/10 border border-[#58a6ff]/40 text-[#58a6ff] hover:bg-[#58a6ff]/20 hover:border-[#58a6ff] transition-colors w-fit"
              >
                <Icons.Share />
                <span className="text-sm font-semibold tracking-wide uppercase">
                  Export as image
                </span>
              </button>
            </div>

            <div className="bg-[#161b22]/80 backdrop-blur-md border border-[#30363d] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-[#58a6ff] opacity-5 filter blur-[100px] rounded-full pointer-events-none"></div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-linear-to-br from-[#58a6ff] to-[#bc8cff] rounded-full blur-sm opacity-50"></div>
                  <Image
                    src={data.user.avatar}
                    alt="avatar"
                    className="w-28 h-28 rounded-full border-2 border-[#0d1117] relative z-10"
                    width={112}
                    height={112}
                  />
                </div>

                <div className="flex-1">
                  <h2 className="text-4xl font-bold tracking-tight text-white mb-1">{data.user.name}</h2>
                  <a href={`https://github.com/${data.user.username}`} target="_blank" className="text-xl text-[#58a6ff] hover:underline hover:text-[#79c0ff] transition-colors font-mono">
                    @{data.user.username}
                  </a>
                  {data.user.bio && <p className="text-[#8b949e] mt-4 max-w-2xl text-lg leading-relaxed">{data.user.bio}</p>}

                  <div className="flex gap-6 mt-6">
                    <div className="flex items-center gap-2 text-[#8b949e]">
                      <Icons.Users />
                      <span className="text-white font-bold">{data.user.followers}</span> followers
                    </div>
                    <div className="flex items-center gap-2 text-[#8b949e]">
                      <span className="text-white font-bold">{data.user.following}</span> following
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatBox icon={Icons.Repo} label="Repositories" value={data.stats.totalRepos} color="text-[#58a6ff]" />
              <StatBox icon={Icons.Star} label="Stars Earned" value={data.stats.totalStars} color="text-[#e3b341]" />
              <StatBox icon={Icons.GitCommit} label="Commits" value={data.stats.totalCommits} color="text-[#3fb950]" />
              <StatBox icon={Icons.Flame} label="Current Streak" value={`${data.stats.currentStreak} Days`} color="text-[#ffa657]" />
            </div>

            <div className="relative overflow-hidden rounded-2xl p-1">
              <div className="absolute inset-0 bg-linear-to-r from-[#58a6ff] via-[#bc8cff] to-[#3fb950] opacity-20"></div>
              <div className="relative bg-[#161b22] rounded-xl p-8 md:p-12 text-center border border-[#30363d]">
                <h3 className="text-[#8b949e] uppercase tracking-widest text-sm font-semibold mb-4">Development Persona</h3>
                <p className="text-4xl md:text-6xl font-black text-[#58a6ff] mb-4">
                  {data.stats.personality}
                </p>
                <p className="text-[#8b949e] text-lg">
                  Peak productivity hits at <span className="text-white font-mono bg-[#30363d] px-2 py-1 rounded">{data.stats.mostActiveHour}:00</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 flex flex-col">
                <div className="mb-6 flex justify-between items-center">
                  <h3 className="text-xl font-bold">Top Languages</h3>
                  <div className="text-xs text-[#8b949e] border border-[#30363d] px-2 py-1 rounded-md">By Usage</div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.stats.topLanguages}
                        dataKey="count"
                        nameKey="language"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        stroke="none"
                      >
                        {data.stats.topLanguages.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 justify-center mt-4">
                  {data.stats.topLanguages.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-[#8b949e]">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></span>
                      {entry.language}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-bold">Daily Rhythm</h3>
                  <p className="text-sm text-[#8b949e]">Commits by hour of day</p>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.stats.hourlyActivity.map((count, hour) => ({ hour: `${hour}:00`, count }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#30363d" opacity={0.5} />
                      <XAxis
                        dataKey="hour"
                        stroke="#8b949e"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        interval={3}
                      />
                      <YAxis
                        stroke="#8b949e"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        width={30}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#30363d', opacity: 0.4 }} />
                      <Bar
                        dataKey="count"
                        fill="#58a6ff"
                        radius={[4, 4, 0, 0]}
                        barSize={12}
                        activeBar={{ fill: '#bc8cff' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Pull Requests', value: data.stats.pullRequests, icon: Icons.GitPullRequest, color: 'text-[#58a6ff]' },
                { label: 'Issues Opened', value: data.stats.issues, icon: Icons.AlertCircle, color: 'text-[#3fb950]' },
                { label: 'Forks Created', value: data.stats.totalForks, icon: Icons.GitFork, color: 'text-[#d2a8ff]' },
              ].map((item, i) => (
                <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 flex items-center gap-6 group hover:border-[#8b949e] transition-colors">
                  <div className={`p-4 rounded-full bg-[#0d1117] border border-[#30363d] ${item.color}`}>
                    <item.icon />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{item.value}</p>
                    <p className="text-sm text-[#8b949e] font-medium">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-8 border-t border-[#30363d]">
              <p className="text-[#8b949e] text-sm">Generated with <span className="text-[#58a6ff] font-bold">Rebase</span> • 2025</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
