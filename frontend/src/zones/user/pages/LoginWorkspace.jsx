import { useMemo, useState } from 'react'
import { loginWithEmailPassword, registerWithEmailPassword } from '../../../helpers/authUseCases'
import { AUTH_ROLES, getRoleLabel } from '../../../helpers/authRoles'
import { authApi } from '../../../services/apiService'
import GoogleToneLoginCard from '../components/GoogleToneLoginCard'

function getErrorMessage(error, fallback) {
    return error.response?.data?.detail || error.message || fallback
}

export default function LoginWorkspace({ onLoginSuccess, onClose, hideHint = false }) {
    const [mode, setMode] = useState('login')
    const [form, setForm] = useState({
        role: AUTH_ROLES.USER,
        name: '',
        email: '',
        password: '',
    })
    const [status, setStatus] = useState(null)
    const [loading, setLoading] = useState(false)

    const activeRole = useMemo(() => getRoleLabel(form.role), [form.role])

    async function handleSubmit(event) {
        event.preventDefault()
        setLoading(true)
        setStatus(null)

        try {
            const result = mode === 'register'
                ? await registerWithEmailPassword(authApi, form)
                : await loginWithEmailPassword(authApi, form)
            setStatus({
                type: 'success',
                message: mode === 'register'
                    ? `Tạo tài khoản thành công: ${result.user.name}`
                    : `Đăng nhập thành công ${activeRole}: ${result.user.name}`,
            })
            if (onLoginSuccess) {
                onLoginSuccess(result.user, result.access_token)
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: getErrorMessage(error, 'Đăng nhập thất bại.'),
            })
        } finally {
            setLoading(false)
        }
    }

    async function handleGoogleSuccess(credentialResponse) {
        setLoading(true)
        setStatus(null)

        try {
            const result = await authApi.googleLogin({
                google_token: credentialResponse.credential,
                role: form.role,
            })
            setStatus({
                type: 'success',
                message: `Đăng nhập Google thành công: ${result.user.name}`,
            })
            if (onLoginSuccess) {
                onLoginSuccess(result.user, result.access_token)
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: getErrorMessage(error, 'Đăng nhập Google thất bại.'),
            })
        } finally {
            setLoading(false)
        }
    }

    function handleChangeField(event) {
        const { name, value } = event.target
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    function handleChangeRole(role) {
        setForm((prev) => ({
            ...prev,
            role,
            email: '',
            password: '',
        }))
        setStatus(null)
    }

    function handleChangeMode(nextMode) {
        setMode(nextMode)
        setForm((prev) => ({
            ...prev,
            role: nextMode === 'register' ? AUTH_ROLES.USER : prev.role,
            password: '',
        }))
        setStatus(null)
    }

    return (
        <section className="float-in stagger-2">
            <GoogleToneLoginCard
                form={form}
                loading={loading}
                onChangeField={handleChangeField}
                onChangeMode={handleChangeMode}
                onChangeRole={handleChangeRole}
                onClose={onClose}
                onGoogleSuccess={handleGoogleSuccess}
                onSubmit={handleSubmit}
                mode={mode}
                status={status}
            />
            {!hideHint && (
                <p className="mt-3 text-center text-xs text-slate-500">
                    Tài khoản demo: admin@gmail.com/123123 hoặc user@gmail.com/123123
                </p>
            )}
        </section>
    )
}
