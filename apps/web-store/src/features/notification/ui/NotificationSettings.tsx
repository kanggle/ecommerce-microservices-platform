'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ErrorMessage } from '@repo/ui';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useNotificationPreferences } from '../model/use-notification-preferences';
import { useUpdatePreferences } from '../model/use-update-preferences';

interface ToggleProps {
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}

function SettingToggle({ label, description, checked, disabled, onChange }: ToggleProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-4) 0',
        borderBottom: '1px solid var(--color-border-light)',
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
          {label}
        </p>
        <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
          {description}
        </p>
      </div>
      <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', flexShrink: 0, marginLeft: 'var(--space-4)' }}>
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={label}
          style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
        />
        <span
          style={{
            position: 'absolute',
            cursor: disabled ? 'not-allowed' : 'pointer',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-gray-300)',
            borderRadius: '12px',
            transition: 'background-color var(--transition-fast)',
          }}
        >
          <span
            style={{
              position: 'absolute',
              height: '18px',
              width: '18px',
              left: checked ? '23px' : '3px',
              bottom: '3px',
              backgroundColor: 'var(--color-white)',
              borderRadius: '50%',
              transition: 'left var(--transition-fast)',
            }}
          />
        </span>
      </label>
    </div>
  );
}

export function NotificationSettings() {
  const { data: preferences, isLoading, isError, refetch } = useNotificationPreferences();
  const updatePreferences = useUpdatePreferences();

  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (preferences) {
      setEmailEnabled(preferences.emailEnabled);
      setSmsEnabled(preferences.smsEnabled);
      setPushEnabled(preferences.pushEnabled);
    }
  }, [preferences]);

  async function handleToggle(
    field: 'emailEnabled' | 'smsEnabled' | 'pushEnabled',
    value: boolean,
  ) {
    const updatedState = { emailEnabled, smsEnabled, pushEnabled, [field]: value };

    if (field === 'emailEnabled') setEmailEnabled(value);
    if (field === 'smsEnabled') setSmsEnabled(value);
    if (field === 'pushEnabled') setPushEnabled(value);

    setSaveSuccess(false);

    try {
      await updatePreferences.mutateAsync(updatedState);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      // Rollback on failure
      if (field === 'emailEnabled') setEmailEnabled(!value);
      if (field === 'smsEnabled') setSmsEnabled(!value);
      if (field === 'pushEnabled') setPushEnabled(!value);
    }
  }

  const error = isError ? '알림 설정을 불러오는데 실패했습니다.' : '';

  return (
    <div>
      <Link
        href="/my/notifications"
        style={{
          display: 'inline-block',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--space-4)',
          textDecoration: 'none',
        }}
      >
        &larr; 알림 목록
      </Link>

      <h1 className="page-title">알림 설정</h1>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) 0' }}>
              <div>
                <Skeleton width="80px" height="14px" />
                <div style={{ marginTop: 'var(--space-1)' }}>
                  <Skeleton width="160px" height="12px" />
                </div>
              </div>
              <Skeleton width="44px" height="24px" borderRadius="12px" />
            </div>
          ))}
        </div>
      )}
      {error && <ErrorMessage message={error} onRetry={() => refetch()} />}

      {!isLoading && !error && (
        <div>
          <SettingToggle
            label="이메일"
            description="이메일로 알림을 받습니다"
            checked={emailEnabled}
            disabled={updatePreferences.isPending}
            onChange={(v) => handleToggle('emailEnabled', v)}
          />
          <SettingToggle
            label="SMS"
            description="문자 메시지로 알림을 받습니다"
            checked={smsEnabled}
            disabled={updatePreferences.isPending}
            onChange={(v) => handleToggle('smsEnabled', v)}
          />
          <SettingToggle
            label="푸시"
            description="푸시 알림을 받습니다"
            checked={pushEnabled}
            disabled={updatePreferences.isPending}
            onChange={(v) => handleToggle('pushEnabled', v)}
          />

          {saveSuccess && (
            <p
              data-testid="save-success"
              style={{
                marginTop: 'var(--space-4)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-success)',
              }}
            >
              설정이 저장되었습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
