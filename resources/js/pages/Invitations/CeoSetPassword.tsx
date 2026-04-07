import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';

const PASSWORD_RULES = {
  len: (v: string) => v.length >= 8,
  num: (v: string) => /[0-9]/.test(v),
};

type Props = {
  token: string;
  email: string;
  companyName: string;
};

export default function CeoSetPassword({ token, email, companyName }: Props) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm({
    token,
    password: '',
    password_confirmation: '',
  });

  const password = form.data.password;
  const passwordConfirmation = form.data.password_confirmation;
  const met = {
    len: PASSWORD_RULES.len(password),
    num: PASSWORD_RULES.num(password),
  };
  const allMet = Object.values(met).every(Boolean);
  const match = password && password === passwordConfirmation;
  const canSubmit = allMet && match;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    form.post('/invitations/set-password', { preserveScroll: true });
  };

  const ruleItems = [
    { key: 'len', label: t('invitation_ceo_set_password.rule_len'), ok: met.len },
    { key: 'num', label: t('invitation_ceo_set_password.rule_num'), ok: met.num },
  ];

  return (
    <>
      <Head title={t('invitation_ceo_set_password.page_title')} />
      <div className="grid min-h-screen md:grid-cols-[54%_46%]">
        <div className="relative hidden overflow-hidden bg-[#0E1628] p-10 md:flex md:flex-col md:px-12 md:py-10">
          <div className="relative z-10 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-lg">
              🏢
            </div>
            <div>
              <div className="font-semibold text-white">{t('invitation_ceo_set_password.brand')}</div>
              <div className="text-[10px] uppercase tracking-wider text-white/35">{t('invitation_ceo_set_password.by_line')}</div>
            </div>
          </div>
          <div className="relative z-10 mt-12 flex flex-1 flex-col justify-center">
            <div className="mb-10 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#C9A84C]/30 bg-[#C9A84C]/15 text-xl">
                👔
              </div>
              <div>
                <div className="font-semibold text-white">{t('invitation_ceo_set_password.role_title')}</div>
                <div className="text-sm text-white/40">{companyName}</div>
              </div>
            </div>
            <h1 className="mb-4 text-3xl font-bold leading-tight text-white md:text-4xl">
              {t('invitation_ceo_set_password.hero_line1')}
              <br />
              <span className="text-[#E8C96B]">{t('invitation_ceo_set_password.hero_highlight')}</span>
            </h1>
            <p className="max-w-md text-sm font-light leading-relaxed text-white/50">
              {t('invitation_ceo_set_password.hero_description')}
            </p>
            <div className="mt-10 flex flex-col gap-3">
              <div className="flex items-center gap-3 opacity-60">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-emerald-500/20 text-xs font-semibold text-emerald-400">
                  ✓
                </div>
                <span className="text-sm text-white/60">{t('invitation_ceo_set_password.step1_done')}</span>
              </div>
              <div className="h-5 w-px bg-white/10 ml-3.5" />
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#C9A84C] bg-[#C9A84C] text-xs font-semibold text-[#0E1628]">
                  2
                </div>
                <span className="text-sm font-medium text-white">{t('invitation_ceo_set_password.step2')}</span>
              </div>
              <div className="h-5 w-px bg-white/10 ml-3.5" />
              <div className="flex items-center gap-3 opacity-45">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-xs font-semibold text-white/40">
                  3
                </div>
                <span className="text-sm text-white/50">{t('invitation_ceo_set_password.step3')}</span>
              </div>
            </div>
          </div>
          <div className="relative z-10 flex gap-5 text-[11px] text-white/25">
            <span>{t('invitation_ceo_set_password.trust_1')}</span>
            <span>·</span>
            <span>{t('invitation_ceo_set_password.trust_2')}</span>
            <span>·</span>
            <span>{t('invitation_ceo_set_password.trust_3')}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-[#F2EEE7] p-8 md:p-12">
          <Link
            href="/"
            className="absolute left-8 top-8 flex items-center gap-1.5 text-sm text-[#4A4E69] opacity-60 hover:opacity-100 md:left-8 md:top-8"
          >
            ← {t('invitation_ceo_set_password.back_home')}
          </Link>
          <div className="w-full max-w-[400px] rounded-xl bg-white p-8 shadow-sm md:p-10">
            <h2 className="font-serif text-[22px] font-bold tracking-tight text-[#0E1628]">
              {t('invitation_ceo_set_password.form_title')}
            </h2>
            <p className="mt-1.5 text-[13px] font-light leading-relaxed text-[#4A4E69]">
              {t('invitation_ceo_set_password.form_subtitle')}
            </p>
            <form onSubmit={submit} className="mt-8 space-y-5">
              <div>
                <Label className="text-xs font-medium text-[#0E1628]">{t('invitation_ceo_set_password.email')}</Label>
                <Input
                  type="email"
                  value={email}
                  readOnly
                  className="mt-1.5 bg-[#F5F3EF] text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-[#0E1628]">{t('invitation_ceo_set_password.new_password')}</Label>
                <div className="relative mt-1.5">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={form.data.password}
                    onChange={(e) => {
                      form.setData('password', e.target.value);
                      clearInertiaFieldError(form.clearErrors, 'password');
                    }}
                    placeholder={t('invitation_ceo_set_password.password_placeholder')}
                    className="pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="mt-2 flex flex-col gap-1 text-[11.5px]">
                  {ruleItems.map(({ key, label, ok }) => (
                    <div
                      key={key}
                      className={`flex items-center gap-2 ${ok ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                      <span
                        className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] ${
                          ok ? 'bg-emerald-500 text-white' : 'bg-slate-200'
                        }`}
                      >
                        {ok ? '✓' : ''}
                      </span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-[#0E1628]">{t('invitation_ceo_set_password.confirm_password')}</Label>
                <div className="relative mt-1.5">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.data.password_confirmation}
                    onChange={(e) => {
                      form.setData('password_confirmation', e.target.value);
                      clearInertiaFieldError(form.clearErrors, 'password_confirmation');
                    }}
                    placeholder={t('invitation_ceo_set_password.confirm_placeholder')}
                    className="pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordConfirmation && (
                  <p
                    className={`mt-1.5 text-[11.5px] ${
                      match ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {match ? t('invitation_ceo_set_password.match_ok') : t('invitation_ceo_set_password.match_bad')}
                  </p>
                )}
              </div>
              <InputError message={form.errors.password} className="mt-1" />
              <InputError message={form.errors.token} className="mt-1" />
              <Button
                type="submit"
                disabled={!canSubmit || form.processing}
                className="w-full bg-[#0E1628] font-medium hover:bg-[#1A2540]"
              >
                {form.processing ? t('invitation_ceo_set_password.processing') : t('invitation_ceo_set_password.submit')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
