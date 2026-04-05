'use client';

import { useState, useCallback } from 'react';
import type { UserProfile } from '@repo/types';
import { isApiError, ERROR_MESSAGES } from '@repo/types/guards';
import type { ProfileFieldErrors } from '../model/types';
import { useUpdateProfile } from '../model/use-update-profile';
import { Toast } from '@/shared/ui';
import { ProfileFormField } from './ProfileFormField';
import { ProfileImageSection } from './ProfileImageSection';
import { useProfileImage } from '@/shared/context/ProfileImageContext';

interface ProfileFormProps {
  profile: UserProfile;
  onUpdated: () => void;
}

function validateFields(nickname: string, phone: string): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};

  if (nickname.length > 0 && nickname.trim().length === 0) {
    errors.nickname = '닉네임을 올바르게 입력해주세요.';
  }

  if (phone.length > 0 && !/^[\d-]+$/.test(phone)) {
    errors.phone = '전화번호 형식이 올바르지 않습니다.';
  }

  return errors;
}

export function ProfileForm({ profile, onUpdated }: ProfileFormProps) {
  const [nickname, setNickname] = useState(profile.nickname ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [profileImageUrl, setProfileImageUrl] = useState(profile.profileImageUrl ?? '');
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { setImageUrl: setGlobalProfileImage } = useProfileImage();
  const updateMutation = useUpdateProfile();
  const isSubmitting = updateMutation.isPending;

  const clearToast = useCallback(() => setToast(null), []);

  const hasChanges =
    nickname !== (profile.nickname ?? '') ||
    phone !== (profile.phone ?? '') ||
    profileImageUrl !== (profile.profileImageUrl ?? '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting || !hasChanges) return;

    const errors = validateFields(nickname, phone);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setToast(null);

    const data: Record<string, string> = {};
    if (nickname !== (profile.nickname ?? '')) {
      data.nickname = nickname || '';
    }
    if (phone !== (profile.phone ?? '')) {
      data.phone = phone || '';
    }
    if (profileImageUrl !== (profile.profileImageUrl ?? '')) {
      data.profileImageUrl = profileImageUrl || '';
    }

    updateMutation.mutate(data, {
      onSuccess: (updated) => {
        setToast({ message: '프로필이 수정되었습니다.', type: 'success' });
        setGlobalProfileImage(updated.profileImageUrl ?? '');
        onUpdated();
      },
      onError: (err) => {
        if (isApiError(err)) {
          setToast({
            message: ERROR_MESSAGES[err.code] ?? err.message ?? '프로필 수정에 실패했습니다.',
            type: 'error',
          });
        } else {
          setToast({ message: '프로필 수정에 실패했습니다.', type: 'error' });
        }
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <section className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <h2 className="section-title">기본 정보</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          <ProfileImageSection
            profileImageUrl={profileImageUrl}
            profileName={profile.name}
            onImageChange={setProfileImageUrl}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div>
              <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>이메일</span>
              <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--font-size-sm)' }}>{profile.email}</p>
            </div>
            <div>
              <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>이름</span>
              <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--font-size-sm)' }}>{profile.name}</p>
            </div>
          </div>
        </div>
      </section>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={clearToast} />
      )}

      <section className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <h2 className="section-title">프로필 수정</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <ProfileFormField
            id="nickname"
            label="닉네임"
            type="text"
            value={nickname}
            onChange={(value) => {
              setNickname(value);
              setFieldErrors((prev) => ({ ...prev, nickname: undefined }));
            }}
            error={fieldErrors.nickname}
          />
          <ProfileFormField
            id="phone"
            label="전화번호"
            type="tel"
            value={phone}
            onChange={(value) => {
              setPhone(value);
              setFieldErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            placeholder="010-0000-0000"
            error={fieldErrors.phone}
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={!hasChanges || isSubmitting}
        className="btn btn-primary btn-lg"
        style={{ width: '100%' }}
      >
        {isSubmitting ? '수정 중...' : '프로필 수정'}
      </button>
    </form>
  );
}
