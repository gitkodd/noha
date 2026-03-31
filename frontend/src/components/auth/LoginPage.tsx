import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { Mail, Lock, Loader2, ArrowRight, Dna } from 'lucide-react'
import gsap from 'gsap'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setAuth } = useAuthStore()
  
  const formRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animação de entrada GSAP
    const tl = gsap.timeline()
    tl.fromTo(bgRef.current, { opacity: 0 }, { opacity: 1, duration: 1.5, ease: 'power2.out' })
    tl.fromTo(formRef.current, 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1, ease: 'back.out(1.7)' }, 
      '-=1'
    )
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) throw signUpError
        if (data.user) {
          alert('Cadastro realizado! Se o e-mail de confirmação estiver ativado, verifique sua caixa de entrada.')
          setIsSignUp(false)
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        setAuth(data.user, data.session)
      }
    } catch (err: any) {
      setError(err.message || 'Erro na autenticação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      {/* Background dinâmico com gradiente */}
      <div 
        ref={bgRef}
        className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.08),transparent_70%)]" 
      />
      
      <div 
        ref={formRef}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-surface/40 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5">
          {/* Logo / Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20 rotate-3">
              <Dna className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter">NOHA</h1>
            <p className="text-sm text-text-muted font-medium mt-1">
              {isSignUp ? 'Crie sua conta exclusiva' : 'Acesse seu Portal Cloud'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1.5">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                  <Mail className="w-5 h-5 text-text-muted group-focus-within:text-primary" />
                </div>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full h-14 bg-background/50 border border-border/80 rounded-2xl pl-12 pr-4 text-foreground placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-text-muted group-focus-within:text-primary" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full h-14 bg-background/50 border border-border/80 rounded-2xl pl-12 pr-4 text-foreground placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold py-3 px-4 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Cadastrar Agora' : 'Entrar no Sistema'}
                  {!isSignUp && <ArrowRight className="w-5 h-5" />}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs font-bold uppercase tracking-wider text-text-muted/40 hover:text-text-muted transition-colors cursor-pointer"
               onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Já tenho acesso' : 'Quero acesso exclusivo'}
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-center text-[10px] text-text-muted/40 font-bold uppercase tracking-[0.2em]">
          Noha Home Decor • Cloud Portal v1.0
        </p>
      </div>
    </div>
  )
}

