'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  MapPin, 
  Utensils, 
  Gem, 
  Loader2, 
  AlertCircle, 
  Edit3, 
  Check, 
  X, 
  ArrowLeft,
  Calendar,
  Send,
  Bot,
  User,
  CheckCircle2,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';


interface ItineraryItem {
  time: string;
  name: string;
  type: 'attraction' | 'food' | 'hidden_gem';
  estimatedCost: number;
  notes: string;
}

interface ItineraryDay {
  day: number;
  district: string;
  items: ItineraryItem[];
  dailyEstimatedCost: number;
}

interface ItineraryDetail {
  _id: string;
  userId: string;
  title: string;
  days: ItineraryDay[];
  budget: number;
  interests: string[];
  generatedAt: string;
  status: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isEdit?: boolean;
}

function TypeIcon({ type }: { type: string }) {
  if (type === 'food') return <Utensils className="h-4 w-4" />;
  if (type === 'hidden_gem') return <Gem className="h-4 w-4" />;
  return <MapPin className="h-4 w-4" />;
}

function typeBadgeColor(type: string): string {
  if (type === 'food') return 'text-madder-red border-madder-red/20 bg-madder-red/5';
  if (type === 'hidden_gem') return 'text-indigo-deep border-indigo-deep/20 bg-indigo-deep/5';
  return 'text-indigo-deep border-indigo-deep/20 bg-indigo-deep/5';
}

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const tripId = resolvedParams.id;

  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [trip, setTrip] = useState<ItineraryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  // Editable Title State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);
  const [deletingTrip, setDeletingTrip] = useState(false);


  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [updateNotice, setUpdateNotice] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push(`/login?callbackUrl=/trips/${tripId}`);
    }
  }, [sessionStatus, router, tripId]);

  useEffect(() => {
    async function loadTrip() {
      if (sessionStatus !== 'authenticated') return;
      try {
        const res = await fetch(`/api/itinerary/${tripId}`);
        setStatusCode(res.status);

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to load itinerary.');
        }

        const data = await res.json();
        setTrip(data);
        setTitleInput(data.title);
      } catch (err: any) {
        setError(err?.message || 'Failed to load itinerary.');
      } finally {
        setLoading(false);
      }
    }

    loadTrip();
  }, [sessionStatus, tripId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSaveTitle = async () => {
    if (!titleInput.trim() || !trip) return;
    setSavingTitle(true);
    try {
      const res = await fetch(`/api/itinerary/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: titleInput.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update title.');
      }

      const updated = await res.json();
      setTrip(updated);
      setIsEditingTitle(false);
    } catch (err: any) {
      alert(err?.message || 'Failed to update trip title.');
    } finally {
      setSavingTitle(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!trip) return;
    if (!window.confirm('Delete this trip? This cannot be undone.')) return;
    setDeletingTrip(true);
    try {
      const res = await fetch(`/api/itinerary/${tripId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to delete trip.');
      }

      router.push('/trips');
    } catch (err: any) {
      alert(err?.message || 'Failed to delete trip.');
      setDeletingTrip(false);
    }
  };


  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const messageText = chatInput.trim();
    if (!messageText || isSending) return;

    const userMessage: ChatMessage = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsSending(true);
    setChatError(null);
    setUpdateNotice(null);

    try {
      // Send conversation history without client-only UI flags
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(`/api/itinerary/${tripId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversationHistory,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to send message.');
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        isEdit: data.type === 'edit',
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.type === 'edit' && Array.isArray(data.updatedDays)) {
        setTrip((prev) => (prev ? { ...prev, days: data.updatedDays } : prev));
        setUpdateNotice('Itinerary updated');
        setTimeout(() => setUpdateNotice(null), 6000);
      }
    } catch (err: any) {
      setChatError(err?.message || 'Couldn\'t process that request — try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (sessionStatus === 'loading' || (sessionStatus === 'authenticated' && loading)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 text-center">
        <div className="jali-divider-indigo w-24 animate-jaliResolve mb-4" />
        <p className="text-iron-black/50 font-medium">Loading itinerary...</p>
      </div>
    );
  }

  if (error || statusCode === 403 || statusCode === 404) {
    return (
      <div className="flex-1 max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="border border-madder-red/30 bg-madder-red/5 text-madder-red p-8 rounded-lg">
          <AlertCircle className="h-10 w-10 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">
            {statusCode === 403 ? 'Access denied' : statusCode === 404 ? 'Trip not found' : 'Error'}
          </h2>
          <p className="text-iron-black/60 mb-6 text-sm">{error}</p>
          <Link href="/trips">
            <Button variant="outline" className="rounded-md">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to My Trips
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const totalCost = trip.days.reduce((acc, day) => acc + (day.dailyEstimatedCost || 0), 0);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 animate-fadeSlideIn">
      {/* Navigation */}
      <div className="mb-6">
        <Link href="/trips" className="inline-flex items-center gap-2 text-sm font-medium text-iron-black/50 hover:text-indigo-deep transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to My Trips
        </Link>
      </div>

      {/* Trip Header */}
      <div className="border border-desert-dust rounded-lg p-5 sm:p-7 bg-white mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 max-w-lg">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="bg-white border border-indigo-deep rounded-md px-4 py-2 text-xl font-bold text-iron-black focus:outline-none w-full"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleSaveTitle}
                  disabled={savingTitle}
                  className="bg-indigo-deep hover:bg-indigo-hover text-resist-white font-bold rounded-md"
                >
                  {savingTitle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditingTitle(false);
                    setTitleInput(trip.title);
                  }}
                  className="rounded-md"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-iron-black">
                  {trip.title}
                </h1>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="p-2 rounded-md text-iron-black/30 hover:text-indigo-deep hover:bg-dust-lighter border border-transparent hover:border-desert-dust transition-all"
                  title="Edit title"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDeleteTrip}
                  disabled={deletingTrip}
                  className="p-2 rounded-md text-iron-black/30 hover:text-madder-red hover:bg-madder-red/5 border border-transparent hover:border-madder-red/30 transition-all disabled:opacity-50"
                  title="Delete trip"
                >
                  {deletingTrip ? (
                    <Loader2 className="h-4 w-4 animate-spin text-madder-red" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>

            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-iron-black/50 mt-3">
              <span className="flex items-center gap-1.5 bg-dust-lighter px-2.5 py-1 rounded-sm border border-desert-dust/60 font-data">
                <Calendar className="h-3.5 w-3.5 text-indigo-deep/60" />
                {new Date(trip.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5 bg-dust-lighter px-2.5 py-1 rounded-sm border border-desert-dust/60 font-data">
                {trip.days.length} days
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-dust-lighter border border-desert-dust/60 rounded-md p-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-indigo-deep/10 flex items-center justify-center border border-indigo-deep/15 text-indigo-deep">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs text-iron-black/50 font-medium block">Estimated cost</span>
                <span className="text-xl font-extrabold text-indigo-deep font-data">
                  ₹{totalCost.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div className="border-t sm:border-t-0 sm:border-l border-desert-dust pt-2 sm:pt-0 sm:pl-4 text-xs text-iron-black/50 font-data">
              <div>Budget: <strong className="text-iron-black/70">₹{trip.budget.toLocaleString('en-IN')}</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Itinerary + Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Day Cards */}
        <div className="lg:col-span-2 space-y-5">
          {trip.days.map((dayPlan) => (
            <div key={dayPlan.day} className="border border-desert-dust rounded-lg overflow-hidden bg-white">
              {/* Day Header */}
              <div className="bg-dust-lighter px-5 py-3 border-b border-desert-dust/60 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-sm bg-indigo-deep text-resist-white flex items-center justify-center text-xs font-bold">
                    {dayPlan.day}
                  </span>
                  <h3 className="text-sm font-bold text-iron-black">
                    Day {dayPlan.day} — {dayPlan.district}
                  </h3>
                </div>
                <span className="text-xs font-medium text-iron-black/50 font-data">
                  ₹{dayPlan.dailyEstimatedCost}
                </span>
              </div>

              {/* Items */}
              <div className="p-5 space-y-4">
                {dayPlan.items.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="relative flex gap-3 pb-4 last:pb-0 last:border-none border-b border-desert-dust/30"
                  >
                    {idx < dayPlan.items.length - 1 && (
                      <div className="absolute top-7 left-3.5 bottom-0 w-px bg-desert-dust/40 -translate-x-1/2" />
                    )}

                    <div className={`h-7 w-7 rounded-sm flex items-center justify-center shrink-0 mt-0.5 ${typeBadgeColor(item.type)}`}>
                      <TypeIcon type={item.type} />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-iron-black/40 font-data">
                            {item.time}
                          </span>
                          <h4 className="font-bold text-iron-black text-sm">
                            {item.name}
                          </h4>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm border uppercase tracking-wider ${typeBadgeColor(item.type)}`}>
                            {item.type.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-indigo-deep font-data">
                          ₹{item.estimatedCost}
                        </span>
                      </div>
                      <p className="text-sm text-iron-black/60 leading-relaxed">
                        {item.notes}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Chat Panel — Night Indigo */}
        <div className="lg:col-span-1 lg:sticky lg:top-20">
          <div className="bg-night-band border border-night-indigo/30 rounded-lg flex flex-col h-[600px] overflow-hidden">
            {/* Panel Header */}
            <div className="px-4 py-3 border-b border-resist-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-indigo-deep flex items-center justify-center text-resist-white">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-resist-white text-sm">Trip Assistant</h3>
                  <p className="text-[11px] text-resist-white/50">Ask questions or request changes</p>
                </div>
              </div>
              {updateNotice && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-deep/40 border border-indigo-deep/60 text-resist-white/90 px-2 py-0.5 rounded-sm">
                  <CheckCircle2 className="h-3 w-3" />
                  {updateNotice}
                </span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8 text-resist-white/50 space-y-3">
                  <div className="h-10 w-10 rounded-md bg-night-indigo border border-resist-white/10 flex items-center justify-center text-resist-white/40">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-resist-white/80 text-sm">How can I help with this trip?</p>
                    <p className="text-xs text-resist-white/40 mt-1 leading-relaxed">
                      Ask questions or request changes:
                    </p>
                  </div>
                  <div className="w-full space-y-1.5 pt-2 text-left">
                    {[
                      'Swap Day 2 for something less touristy',
                      'Add more authentic food stops',
                      'Reduce the estimated cost on Day 1'
                    ].map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setChatInput(suggestion);
                        }}
                        className="w-full text-left bg-night-indigo/60 hover:bg-night-indigo border border-resist-white/10 hover:border-indigo-deep/40 rounded-md px-3 py-2 text-[11px] text-resist-white/60 hover:text-resist-white/80 transition-colors cursor-pointer"
                      >
                        &ldquo;{suggestion}&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="h-6 w-6 rounded-sm bg-indigo-deep flex items-center justify-center text-resist-white shrink-0 mt-0.5">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-md px-3 py-2 space-y-1 ${
                        msg.role === 'user'
                          ? 'bg-indigo-deep text-resist-white font-medium rounded-tr-none'
                          : 'bg-night-indigo border border-resist-white/10 text-resist-white/80 rounded-tl-none'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      {msg.isEdit && (
                        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-resist-white/70 bg-indigo-deep/30 border border-indigo-deep/40 px-2 py-0.5 rounded-sm">
                          <CheckCircle2 className="h-3 w-3" /> Itinerary updated
                        </div>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <div className="h-6 w-6 rounded-sm bg-night-indigo border border-resist-white/10 flex items-center justify-center text-resist-white/60 shrink-0 mt-0.5">
                        <User className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                ))
              )}

              {isSending && (
                <div className="flex items-center gap-2 justify-start">
                  <div className="h-6 w-6 rounded-sm bg-indigo-deep flex items-center justify-center text-resist-white shrink-0">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-night-indigo border border-resist-white/10 rounded-md rounded-tl-none px-3 py-2 text-resist-white/50 flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Updating itinerary...</span>
                  </div>
                </div>
              )}

              {chatError && (
                <div className="bg-madder-red/20 border border-madder-red/30 rounded-md p-2 text-madder-light text-xs flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{chatError}</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-resist-white/10 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask or request changes..."
                disabled={isSending}
                className="flex-1 bg-night-indigo border border-resist-white/10 rounded-md px-3 py-2 text-xs text-resist-white placeholder:text-resist-white/30 focus:outline-none focus:border-indigo-deep/50 disabled:opacity-50"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isSending || !chatInput.trim()}
                className="bg-indigo-deep hover:bg-indigo-light text-resist-white font-bold rounded-md shrink-0 px-3 disabled:opacity-50"
              >
                {isSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
