import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Eye, Pencil, User as UserIcon, Mail, Phone, MapPin, Power, PowerOff } from 'lucide-react'
import { fetchUsers, updateUser, type UserUpdatePayload } from '../../api/users'
import type { User } from '../../types'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatDate } from '../../utils/format'

const schema = z.object({
  id: z.number(),
  fullName: z.string().min(3, 'Họ tên phải có ít nhất 3 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(9, 'Số điện thoại không hợp lệ').optional().or(z.literal('')),
  address: z.string().optional(),
  roleId: z.number().min(1, 'Vui lòng chọn vai trò'),
  enabled: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

const roleOptions = [
  { label: 'Khách hàng', value: 2, code: 'CUSTOMER' },
]

export const AdminUsersPage = () => {
  const queryClient = useQueryClient()
  const { data: allUsers = [] } = useQuery<User[]>({ queryKey: ['users'], queryFn: fetchUsers })
  // Filter to show only CUSTOMER users
  const users = allUsers.filter((user) => user.role === 'CUSTOMER')
  const [viewUser, setViewUser] = useState<User | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [toggleTarget, setToggleTarget] = useState<User | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: UserUpdatePayload = {
        id: values.id,
        email: values.email,
        fullName: values.fullName,
        phone: values.phone || undefined,
        address: values.address || undefined,
        roleId: values.roleId,
        enabled: values.enabled,
      }
      return updateUser(values.id, payload)
    },
    onSuccess: () => {
      toast.success('Đã cập nhật thông tin người dùng')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setEditUser(null)
    },
    onError: (err: unknown) => {
      const error = err as { message?: string }
      toast.error(error?.message ?? 'Không thể cập nhật')
    },
  })

  const toggleEnabledMutation = useMutation({
    mutationFn: (user: User) => {
      const payload: UserUpdatePayload = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone || undefined,
        address: user.address || undefined,
        roleId: user.role === 'ADMIN' ? 1 : 2,
        enabled: !user.enabled,
      }
      return updateUser(user.id, payload)
    },
    onSuccess: (_, user) => {
      toast.success(
        user.enabled
          ? 'Đã vô hiệu hóa tài khoản khách hàng'
          : 'Đã kích hoạt tài khoản khách hàng',
      )
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setToggleTarget(null)
    },
    onError: (err: unknown) => {
      const error = err as { message?: string }
      toast.error(error?.message ?? 'Không thể thay đổi trạng thái tài khoản')
      setToggleTarget(null)
    },
  })

  const openEditModal = (user: User) => {
    setEditUser(user)
    reset({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone ?? '',
      address: user.address ?? '',
      roleId: user.role === 'ADMIN' ? 1 : 2,
      enabled: user.enabled ?? true,
    })
  }

  const onSubmit = (values: FormValues) => updateMutation.mutate(values)

  const filteredUsers = users.filter((user) => {
    const keyword = searchTerm.trim().toLowerCase()
    if (!keyword) return true
    return (
      user.fullName.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword)
    )
  })

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Quản lý khách hàng ({filteredUsers.length})</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="pill pill-success">
              {users.filter((u) => u.enabled).length} Đang hoạt động
            </span>
            <span className="pill pill-danger">
              {users.filter((u) => !u.enabled).length} Đã vô hiệu hóa
            </span>
          </div>
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <Input
            label="Tìm kiếm"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: user.role === 'ADMIN' ? '#fef3c7' : '#dcfce7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <UserIcon
                        size={20}
                        color={user.role === 'ADMIN' ? '#d97706' : '#16a34a'}
                      />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{user.fullName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                        ID: {user.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.phone || '—'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`pill ${user.enabled ? 'pill-success' : 'pill-danger'}`}>
                      {user.enabled ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                  </span>
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => setToggleTarget(user)}
                      disabled={toggleEnabledMutation.isPending}
                      iconLeft={user.enabled ? <PowerOff size={16} /> : <Power size={16} />}
                      style={{
                        color: user.enabled ? 'var(--danger)' : 'var(--success)',
                        padding: '0.25rem 0.5rem',
                      }}
                      title={user.enabled ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt tài khoản'}
                    >
                      {user.enabled ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    </Button>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => setViewUser(user)}
                      iconLeft={<Eye size={16} />}
                    >
                      Xem
                    </Button>
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => openEditModal(user)}
                      iconLeft={<Pencil size={16} />}
                    >
                      Sửa
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View User Modal */}
      <Modal
        open={Boolean(viewUser)}
        onClose={() => setViewUser(null)}
        title="Thông tin người dùng"
        width={480}
      >
        {viewUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                borderRadius: 'var(--radius)',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                <UserIcon
                  size={32}
                  color="#16a34a"
                />
              </div>
              <div>
                <h2 style={{ margin: 0 }}>{viewUser.fullName}</h2>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="pill pill-success">Khách hàng</span>
                <span
                    className={`pill ${viewUser.enabled ? 'pill-success' : 'pill-danger'}`}
                >
                    {viewUser.enabled ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius)',
                }}
              >
                <Mail size={18} color="var(--muted)" />
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Email</div>
                  <div style={{ fontWeight: 500 }}>{viewUser.email}</div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius)',
                }}
              >
                <Phone size={18} color="var(--muted)" />
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Số điện thoại</div>
                  <div style={{ fontWeight: 500 }}>{viewUser.phone || 'Chưa cập nhật'}</div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius)',
                }}
              >
                <MapPin size={18} color="var(--muted)" />
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Địa chỉ</div>
                  <div style={{ fontWeight: 500 }}>{viewUser.address || 'Chưa cập nhật'}</div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius)',
                }}
              >
                <UserIcon size={18} color="var(--muted)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Trạng thái tài khoản</div>
                  <span
                    className={`pill ${viewUser.enabled ? 'pill-success' : 'pill-danger'}`}
                    style={{ marginTop: '0.25rem', display: 'inline-block' }}
                  >
                    {viewUser.enabled ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                  </span>
                </div>
              </div>
            </div>

            {viewUser.createdAt && (
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center' }}>
                Ngày tạo: {formatDate(viewUser.createdAt)}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                type="button"
                onClick={() => {
                  openEditModal(viewUser)
                  setViewUser(null)
                }}
                iconLeft={<Pencil size={16} />}
              >
                Chỉnh sửa
              </Button>
              <Button type="button" variant="outline" onClick={() => setViewUser(null)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={Boolean(editUser)}
        onClose={() => setEditUser(null)}
        title="Cập nhật thông tin người dùng"
      >
        <form className="grid" style={{ gap: '1rem' }} onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Họ và tên *"
            placeholder="Nguyễn Văn A"
            {...register('fullName')}
            error={errors.fullName?.message}
          />
          <Input
            label="Email"
            {...register('email')}
            disabled
            style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
          />
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
          <Select
            label="Vai trò *"
            {...register('roleId', { valueAsNumber: true })}
            error={errors.roleId?.message}
          >
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </Select>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              background: '#f8fafc',
              borderRadius: 'var(--radius)',
            }}
          >
            <input
              type="checkbox"
              id="enabled"
              {...register('enabled')}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            <label htmlFor="enabled" style={{ cursor: 'pointer', fontWeight: 500 }}>
              Tài khoản đang hoạt động
            </label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
              Hủy
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toggle Enabled Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(toggleTarget)}
        title={
          toggleTarget?.enabled
            ? 'Xác nhận vô hiệu hóa tài khoản'
            : 'Xác nhận kích hoạt tài khoản'
        }
        message={
          toggleTarget?.enabled
            ? `Bạn có chắc chắn muốn vô hiệu hóa tài khoản của khách hàng "${toggleTarget?.fullName}" (${toggleTarget?.email})? Khách hàng sẽ không thể đăng nhập sau khi tài khoản bị vô hiệu hóa.`
            : `Bạn có chắc chắn muốn kích hoạt tài khoản của khách hàng "${toggleTarget?.fullName}" (${toggleTarget?.email})?`
        }
        confirmLabel={toggleTarget?.enabled ? 'Vô hiệu hóa' : 'Kích hoạt'}
        isLoading={toggleEnabledMutation.isPending}
        onConfirm={() => toggleTarget && toggleEnabledMutation.mutate(toggleTarget)}
        onCancel={() => setToggleTarget(null)}
      />
    </>
  )
}
