"use client";

import { useState } from 'react';
import { 
  Settings, Globe, Bell, Share2, Shield, 
  Moon, Sun, Database, Mail, DollarSign, Edit,
  Clock, Save, RotateCcw, Copy, Check, Plus, UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isCopied, setIsCopied] = useState(false);

  const copyApiKey = () => {
    navigator.clipboard.writeText("cf_live_8392019382741920");
    setIsCopied(true);
    toast.success("API Key copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const menuItems = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'localization', label: 'Localization', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Share2 },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen pb-20">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[36px] font-black text-[#2d3337] tracking-tight leading-tight">Settings</h1>
        <p className="text-[#596063] text-sm mt-1">Configure your cinema ecosystem and manage team access.</p>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Configuration */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
            
            {/* Sidebar Tabs */}
            <div className="w-full md:w-[220px] bg-gray-50/50 border-r border-gray-100 p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                      ${activeTab === item.id ? 'bg-white text-indigo-600 shadow-sm shadow-indigo-100/50' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-8">
              {activeTab === 'general' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-black text-gray-800">General Settings</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Global Configuration</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-600 uppercase">Cinema Name</label>
                      <input type="text" defaultValue="CineFlow Premium" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-600 uppercase">Primary Email</label>
                      <input type="email" defaultValue="admin@cineflow.com" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-600 uppercase">Default Currency</label>
                      <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none">
                        <option>USD ($)</option>
                        <option>VND (đ)</option>
                        <option>EUR (€)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-600 uppercase">Base Ticket Price</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" defaultValue="12.50" className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-black text-gray-800">Integration & API</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Connect your ecosystem</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-600 uppercase">Public API Key</label>
                      <div className="flex gap-2">
                        <code className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm font-mono text-gray-700 flex items-center">
                          cf_live_8392019382741920
                        </code>
                        <button onClick={copyApiKey} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">
                          {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-600 uppercase">Webhook URL</label>
                      <input type="text" defaultValue="https://yourdomain.com/webhooks/cineflow" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Roles Section */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-gray-800">User Roles & Permissions</h3>
                <p className="text-sm text-gray-500">Define what each team member can see and do.</p>
              </div>
              <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all">
                <Plus className="w-4 h-4" /> Create Role
              </button>
            </div>

            <div className="space-y-4">
              {[
                { name: "Administrator", desc: "Full system access • 4 Users", color: "bg-indigo-100 text-indigo-600" },
                { name: "Branch Manager", desc: "Location specific access • 12 Users", color: "bg-purple-100 text-purple-600" }
              ].map((role, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${role.color}`}>
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-gray-800">{role.name}</p>
                      <p className="text-xs text-gray-400 font-medium">{role.desc}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Appearance & Health */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Appearance Section */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
            <h3 className="text-lg font-black text-gray-800 mb-6">Interface Theme</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button 
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3
                  ${theme === 'light' ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-50 bg-white'}`}
              >
                <div className="w-full h-16 bg-white border border-gray-100 rounded-lg p-2 space-y-2 shadow-sm">
                  <div className="w-1/2 h-2 bg-gray-100 rounded" />
                  <div className="w-3/4 h-2 bg-gray-50 rounded" />
                </div>
                <span className="text-xs font-black text-gray-700">Light Mode</span>
              </button>

              <button 
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3
                  ${theme === 'dark' ? 'border-indigo-600 bg-indigo-900/10' : 'border-gray-50 bg-white'}`}
              >
                <div className="w-full h-16 bg-[#0f172a] rounded-lg p-2 space-y-2 shadow-sm">
                  <div className="w-1/2 h-2 bg-slate-700 rounded" />
                  <div className="w-3/4 h-2 bg-slate-800 rounded" />
                </div>
                <span className="text-xs font-black text-gray-700">Dark Mode</span>
              </button>
            </div>

            <div className="pt-6 border-t border-gray-50">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Brand Accent</label>
              <div className="flex gap-4">
                {['#4a4bd7', '#006d4a', '#842cd3', '#f43f5e', '#f59e0b'].map((color) => (
                  <button 
                    key={color} 
                    className="w-8 h-8 rounded-full shadow-inner transition-transform hover:scale-110 active:scale-95" 
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Security & System */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-black text-gray-800 mb-6">Security</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-gray-700">Auto-Lock Session</p>
                  <p className="text-[11px] text-gray-400 font-medium">Locked after 30 mins</p>
                </div>
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-gray-700">Cloud Sync Backups</p>
                  <p className="text-[11px] text-gray-400 font-medium">Every 24 hours</p>
                </div>
                <div className="w-10 h-6 bg-emerald-500 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-[24px] shadow-sm border-t-4 border-emerald-500 p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-gray-400 uppercase">System Health</span>
              <span className="text-[10px] font-black text-emerald-600 uppercase">Optimal</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className="w-[34%] h-full bg-emerald-500 rounded-full" />
            </div>
            <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
              Database usage is at 34%. Next scheduled maintenance in 12 days.
            </p>
          </div>
        </div>

      </div>

      {/* Fixed Footer Actions */}
      <div className="fixed bottom-8 right-8 flex gap-3 animate-in slide-in-from-bottom-4 duration-500">
        <button className="bg-white border border-gray-100 text-gray-500 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl hover:bg-gray-50 transition-all">
          <RotateCcw className="w-4 h-4" /> Discard
        </button>
        <button onClick={() => toast.success("System settings updated!")} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">
          <Save className="w-4 h-4" /> Update Settings
        </button>
      </div>
    </div>
  );
}