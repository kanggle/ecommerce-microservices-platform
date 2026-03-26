'use client';

import { useState, useCallback } from 'react';
import type { UserProfile } from '@repo/types';
import { isApiError, ERROR_MESSAGES } from '@repo/types/guards';
import type { ProfileFieldErrors } from '../model/types';
import { updateMyProfile } from '../api/user-profile-api';
import { Toast } from '@/shared/ui';

interface ProfileFormProps {
  profile: UserProfile;
  onUpdated: (updated: UserProfile) => void;
}

function validateFields(
  nickname: string,
  phone: string,
  profileImageUrl: string,
): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};

  if (nickname.length > 0 && nickname.trim().length === 0) {
    errors.nickname = '닉네임을 올바르게 입력해주세요.';
  }

  if (phone.length > 0 && !/^[\d-]+$/.test(phone)) {
    errors.phone = '전화번호 형식이 올바르지 않습니다.';
  }

  if (profileImageUrl.length > 0) {
    try {
      new URL(profileImageUrl);
    } catch {
      errors.profileImageUrl = '올바른 URL을 입력해주세요.';
    }
  }

  return errors;
}

export function ProfileForm({ profile, onUpdated }: ProfileFormProps) {
  const [nickname, setNickname] = useState(profile.nickname ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [profileImageUrl, setProfileImageUrl] = useState(
    profile.profileImageUrl ?? '',
  );
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearToast = useCallback(() => setToast(null), []);

  const hasChanges =
    nickname !== (profile.nickname ?? '') ||
    phone !== (profile.phone ?? '') ||
    profileImageUrl !== (profile.profileImageUrl ?? '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting || !hasChanges) return;

    const errors = validateFields(nickname, phone, profileImageUrl);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setToast(null);
    setIsSubmitting(true);

    try {
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

      const updated = await updateMyProfile(data);
      setToast({ message: '프로필이 수정되었습니다.', type: 'success' });
      onUpdated({
        ...profile,
        nickname: updated.nickname,
        phone: updated.phone,
        profileImageUrl: updated.profileImageUrl,
        updatedAt: updated.updatedAt,
      });
    } catch (err) {
      if (isApiError(err)) {
        setToast({
          message: ERROR_MESSAGES[err.code] ?? err.message ?? '프로필 수정에 실패했습니다.',
          type: 'error',
        });
      } else {
        setToast({ message: '프로필 수정에 실패했습니다.', type: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>기본 정보</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <span style={{ fontWeight: 'bold' }}>이메일</span>
            <p style={{ margin: '4px 0 0' }}>{profile.email}</p>
          </div>
          <div>
            <span style={{ fontWeight: 'bold' }}>이름</span>
            <p style={{ margin: '4px 0 0' }}>{profile.name}</p>
          </div>
        </div>
      </section>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={clearToast} />
      )}

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>프로필 수정</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label htmlFor="nickname">닉네임</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setFieldErrors((prev) => ({ ...prev, nickname: undefined }));
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px',
                marginTop: '4px',
              }}
            />
            {fieldErrors.nickname && (
              <p
                role="alert"
                style={{ color: 'red', fontSize: '14px', margin: '4px 0 0' }}
              >
                {fieldErrors.nickname}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="phone">전화번호</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setFieldErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              placeholder="010-0000-0000"
              style={{
                display: 'block',
                width: '100%',
                padding: '8px',
                marginTop: '4px',
              }}
            />
            {fieldErrors.phone && (
              <p
                role="alert"
                style={{ color: 'red', fontSize: '14px', margin: '4px 0 0' }}
              >
                {fieldErrors.phone}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="profileImageUrl">프로필 이미지 URL</label>
            <input
              id="profileImageUrl"
              type="url"
              value={profileImageUrl}
              onChange={(e) => {
                setProfileImageUrl(e.target.value);
                setFieldErrors((prev) => ({
                  ...prev,
                  profileImageUrl: undefined,
                }));
              }}
              placeholder="https://example.com/image.jpg"
              style={{
                display: 'block',
                width: '100%',
                padding: '8px',
                marginTop: '4px',
              }}
            />
            {fieldErrors.profileImageUrl && (
              <p
                role="alert"
                style={{ color: 'red', fontSize: '14px', margin: '4px 0 0' }}
              >
                {fieldErrors.profileImageUrl}
              </p>
            )}
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={!hasChanges || isSubmitting}
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: !hasChanges || isSubmitting ? '#ccc' : '#333',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: !hasChanges || isSubmitting ? 'not-allowed' : 'pointer',
        }}
      >
        {isSubmitting ? '수정 중...' : '프로필 수정'}
      </button>
    </form>
  );
}
