import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Eye, Trash2, Shield, Users } from 'lucide-react'
import { fetchRoles, createRole, deleteRole } from '../../api/roles'
import { fetchUsers } from '../../api/users'
import type { RoleEntity, User } from '../../types'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

const schema = z.object({
  name: z.string().min(2, 'Tên vai trò phải có ít nhất 2 ký tự'),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export const AdminRolesPage = () => {
  const queryClient = useQueryClient()
  const [viewRole, setViewRole] = useState<RoleEntity | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RoleEntity | null>(null)

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  })
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  })

  const getUsersByRole = (roleName: string) => users.filter((u) => u.role === roleName)

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => createRole({ name: values.name, description: values.description }),
    onSuccess: () => {
      toast.success('Đã thêm vai trò')
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      reset()
    },
    onError: (err: unknown) => {
      const error = err as { message?: string }
      toast.error(error?.message ?? 'Không thể tạo vai trò')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => {
      toast.success('Đã xóa vai trò')
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setDeleteTarget(null)
    },
    onError: (err: unknown) => {
      const error = err as { message?: string }
      toast.error(error?.message ?? 'Không thể xóa vai trò. Vai trò có thể đang được sử dụng.')
      setDeleteTarget(null)
    },
  })

  const onSubmit = (values: FormValues) => createMutation.mutate(values)

  if (isLoading) return <p>Đang tải danh sách vai trò...</p>

  return (
    <div className="grid" style={{ gap: '1.5rem' }}>
      <div className="card">
        <h3>Thêm vai trò mới</h3>
        <form className="grid" style={{ gap: '1rem' }} onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Tên vai trò *"
            placeholder="VD: MODERATOR"
            {...register('name')}
            error={errors.name?.message}
          />
          <div className="form-field">
            <label>Mô tả</label>
            <textarea
              rows={2}
              placeholder="Mô tả quyền hạn của vai trò..."
              {...register('description')}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Đang lưu...' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Danh sách vai trò ({roles.length})</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Vai trò</th>
              <th>Mô tả</th>
              <th>Số người dùng</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => {
              const userCount = getUsersByRole(role.name).length
              const deletable = userCount === 0
              return (
                <tr key={role.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Shield
                        size={18}
                        color={role.name === 'ADMIN' ? '#d97706' : '#16a34a'}
                      />
                      <strong>{role.name}</strong>
                    </div>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>
                    {role.description || '—'}
                  </td>
                  <td>
                    <span className={`pill ${userCount > 0 ? 'pill-success' : 'pill-warning'}`}>
                      {userCount} người dùng
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Button
                        type="button"
                        variant="text"
                        onClick={() => setViewRole(role)}
                        iconLeft={<Eye size={16} />}
                      >
                        Xem
                      </Button>
                      <Button
                        type="button"
                        variant="text"
                        onClick={() => setDeleteTarget(role)}
                        disabled={!deletable}
                        style={{ color: deletable ? '#dc2626' : '#9ca3af' }}
                        iconLeft={<Trash2 size={16} />}
                        title={deletable ? 'Xóa vai trò' : 'Không thể xóa: vai trò đang được sử dụng'}
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Role Detail Modal */}
      <Modal
        open={Boolean(viewRole)}
        onClose={() => setViewRole(null)}
        title="Chi tiết vai trò"
        width={560}
      >
        {viewRole && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.25rem',
                background:
                  viewRole.name === 'ADMIN'
                    ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                    : 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                borderRadius: 'var(--radius)',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Shield
                  size={28}
                  color={viewRole.name === 'ADMIN' ? '#d97706' : '#16a34a'}
                />
              </div>
              <div>
                <h2 style={{ margin: 0 }}>{viewRole.name}</h2>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--muted)' }}>
                  {viewRole.description || 'Không có mô tả'}
                </p>
              </div>
            </div>

            <div>
              <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} />
                Người dùng có vai trò này ({getUsersByRole(viewRole.name).length})
              </h4>
              {getUsersByRole(viewRole.name).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 240, overflowY: 'auto' }}>
                  {getUsersByRole(viewRole.name).map((user) => (
                    <div
                      key={user.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        background: '#f8fafc',
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: '#e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                        }}
                      >
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{user.fullName}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
                  Chưa có người dùng nào được gán vai trò này.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button type="button" variant="outline" onClick={() => setViewRole(null)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xác nhận xóa vai trò"
        message={`Bạn có chắc muốn xóa vai trò "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa vai trò"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

