import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { User, Mail, Phone, MapPin, Pencil, Save, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { updateProfile, fetchCurrentProfile } from '../../api/profile'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const schema = z.object({
  fullName: z.string().min(3, 'Họ tên phải có ít nhất 3 ký tự'),
  phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ')
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export const ProfilePage = () => {
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const queryClient = useQueryClient()

  // Fetch current profile to ensure we have the latest data
  const { data: currentProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchCurrentProfile,
    enabled: !!user,
  })

  const profileData = currentProfile || user

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: profileData?.fullName ?? '',
      phone: profileData?.phone ?? '',
      address: profileData?.address ?? '',
    },
  })

  // Update form when profile data changes
  useEffect(() => {
    if (profileData) {
      reset({
        fullName: profileData.fullName ?? '',
        phone: profileData.phone ?? '',
        address: profileData.address ?? '',
      })
    }
  }, [profileData, reset])

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) => updateProfile(values),
    onSuccess: async (updatedUser) => {
      toast.success('Cập nhật thông tin thành công!')
      // Update auth store with new user info (keep existing token)
      const currentToken = useAuthStore.getState().token
      useAuthStore.setState({
        token: currentToken,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          role: updatedUser.role,
          enabled: updatedUser.enabled ?? true,
          phone: updatedUser.phone,
          address: updatedUser.address,
        },
      })
      // Refresh cached profile so all screens see latest data without reload
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
      setIsEditing(false)
    },
    onError: (err: unknown) => {
      const error = err as { message?: string }
      toast.error(error?.message ?? 'Không thể cập nhật thông tin')
    },
  })

  const handleCancel = () => {
    reset({
      fullName: profileData?.fullName ?? '',
      phone: profileData?.phone ?? '',
      address: profileData?.address ?? '',
    })
    setIsEditing(false)
  }

  const onSubmit = (values: FormValues) => updateMutation.mutate(values)

  if (!user || !profileData) return null

  return (
    <div className="grid" style={{ maxWidth: 640, margin: '0 auto', gap: '1.5rem' }}>
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #fff0f6, #ffe4e6)',
            borderRadius: 'var(--radius)',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <User size={36} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{profileData.fullName}</h2>
            <span className={`pill ${profileData.role === 'ADMIN' ? 'pill-warning' : 'pill-success'}`}>
              {profileData.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
            </span>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-grid" style={{ gap: '1rem' }}>
              <Input
                label="Họ và tên"
                placeholder="Nguyễn Văn A"
                {...register('fullName')}
                error={errors.fullName?.message}
              />
              <div className="form-field">
                <label>Email</label>
                <input
                  value={profileData.email}
                  disabled
                  style={{
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    padding: '0.7rem 0.9rem',
                    background: '#f3f4f6',
                    cursor: 'not-allowed',
                  }}
                />
                <small style={{ color: 'var(--muted)' }}>Email không thể thay đổi</small>
              </div>
              <Input
                label="Số điện thoại"
                placeholder="0901234567"
                {...register('phone')}
                error={errors.phone?.message}
              />
              <Input
                label="Địa chỉ"
                placeholder="12 Nguyễn Văn Lượng, Gò Vấp, TP. Hồ Chí Minh"
                {...register('address')}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button type="submit" disabled={updateMutation.isPending} iconLeft={<Save size={16} />}>
                {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} iconLeft={<X size={16} />}>
                Hủy
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius)',
                }}
              >
                <Mail size={20} color="var(--muted)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Email</div>
                  <div style={{ fontWeight: 500 }}>{profileData.email}</div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius)',
                }}
              >
                <Phone size={20} color="var(--muted)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Số điện thoại</div>
                  <div style={{ fontWeight: 500 }}>{profileData.phone || 'Chưa cập nhật'}</div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius)',
                }}
              >
                <MapPin size={20} color="var(--muted)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Địa chỉ</div>
                  <div style={{ fontWeight: 500 }}>{profileData.address || 'Chưa cập nhật'}</div>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              style={{ marginTop: '1.5rem' }}
              iconLeft={<Pencil size={16} />}
            >
              Chỉnh sửa thông tin
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

