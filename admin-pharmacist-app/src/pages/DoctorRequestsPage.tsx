import {
  ArrowLeftRight,
  CheckCircle2,
  ClipboardSignature,
  Clock3,
  FileSearch,
  Inbox,
  Search,
  Sparkles,
  Stethoscope,
  UserRoundPlus,
  XCircle,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'

import { DataTable, TableEmptyState } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { StatusPill } from '@/components/common/StatusPill'
import { useAdminLocale } from '@/hooks/useAdminLocale'
import { useAdminStore } from '@/store/useAdminStore'
import type { DoctorSignupRequestRecord, DoctorSignupRequestStatus } from '@/types/admin'
import { formatDate } from '@/utils/formatters'
import { matchesSearchQuery } from '@/utils/search'

const statusTone: Record<DoctorSignupRequestStatus, 'warning' | 'neutral' | 'success' | 'danger'> = {
  pending: 'warning',
  under_review: 'neutral',
  approved: 'success',
  rejected: 'danger',
}

export function DoctorRequestsPage() {
  const { doctorSignupRequests, setDoctorSignupRequestStatus } = useAdminStore()
  const { text } = useAdminLocale()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | DoctorSignupRequestStatus>('all')
  const [specialtyFilter, setSpecialtyFilter] = useState<'all' | string>('all')
  const [selectedRequest, setSelectedRequest] = useState<DoctorSignupRequestRecord | null>(null)
  const [reviewNote, setReviewNote] = useState('')

  const statusLabels: Record<DoctorSignupRequestStatus, string> = {
    pending: text('بانتظار القبول', 'Pending'),
    under_review: text('قيد المراجعة', 'Under review'),
    approved: text('مقبول', 'Approved'),
    rejected: text('مرفوض', 'Rejected'),
  }

  const specialties = useMemo(
    () => Array.from(new Set(doctorSignupRequests.map((request) => request.specialty))).filter(Boolean),
    [doctorSignupRequests],
  )

  const filteredRequests = doctorSignupRequests.filter((request) => {
    const matchesSearch = matchesSearchQuery(search, [
      request.request_id,
      request.full_name,
      request.email,
      request.phone,
      request.specialty,
      request.clinic_name,
      request.review_note ?? '',
      request.reviewed_by ?? '',
      statusLabels[request.status],
      request.status,
      'pending',
      'under_review',
      'approved',
      'rejected',
    ])

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesSpecialty = specialtyFilter === 'all' || request.specialty === specialtyFilter

    return matchesSearch && matchesStatus && matchesSpecialty
  })

  const summary = useMemo(
    () => ({
      total: doctorSignupRequests.length,
      pending: doctorSignupRequests.filter((request) => request.status === 'pending').length,
      underReview: doctorSignupRequests.filter((request) => request.status === 'under_review').length,
      approved: doctorSignupRequests.filter((request) => request.status === 'approved').length,
      rejected: doctorSignupRequests.filter((request) => request.status === 'rejected').length,
    }),
    [doctorSignupRequests],
  )

  const tableColumns = [
    { key: 'doctor', label: text('الطبيب', 'Doctor') },
    { key: 'specialty', label: text('التخصص والعيادة', 'Specialty & clinic') },
    { key: 'contact', label: text('التواصل', 'Contact') },
    { key: 'status', label: text('الحالة', 'Status') },
    { key: 'dates', label: text('التواريخ', 'Dates') },
    { key: 'actions', label: text('إجراءات', 'Actions') },
  ]

  const openRequest = (request: DoctorSignupRequestRecord) => {
    setSelectedRequest(request)
    setReviewNote(request.review_note ?? '')
  }

  const closeModal = () => {
    setSelectedRequest(null)
    setReviewNote('')
  }

  const submitDecision = (status: DoctorSignupRequestStatus) => {
    if (!selectedRequest) {
      return
    }

    setDoctorSignupRequestStatus(selectedRequest.request_id, status, reviewNote)
    closeModal()
  }

  const firstPending = doctorSignupRequests.find((request) => request.status === 'pending')

  const pipelineSteps = [
    {
      key: 'pending' as const,
      count: summary.pending,
      label: statusLabels.pending,
      icon: Clock3,
    },
    {
      key: 'under_review' as const,
      count: summary.underReview,
      label: statusLabels.under_review,
      icon: ArrowLeftRight,
    },
    {
      key: 'approved' as const,
      count: summary.approved,
      label: statusLabels.approved,
      icon: CheckCircle2,
    },
    {
      key: 'rejected' as const,
      count: summary.rejected,
      label: statusLabels.rejected,
      icon: XCircle,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.section
        className="relative overflow-hidden rounded-[28px] border border-slateAdmin-200 bg-white p-6 shadow-[0_8px_40px_rgba(26,42,58,0.06)] sm:p-8 lg:p-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_100%_-10%,rgba(0,158,219,0.18),transparent_55%),radial-gradient(ellipse_70%_50%_at_0%_100%,rgba(26,42,58,0.08),transparent_50%)]" />
        <div className="pointer-events-none absolute -left-20 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full border border-brandSecondary/15 bg-brandSecondary/5 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-slateAdmin-200 bg-slateAdmin-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slateAdmin-500">
              <Sparkles className="h-3.5 w-3.5 text-brandSecondary" />
              {text('بوابة الأطباء', 'Doctor portal')}
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-slateAdmin-950 sm:text-4xl">
              {text('طلبات تسجيل الأطباء', 'Doctor registration requests')}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slateAdmin-600 sm:text-lg">
              {text(
                'استقبل الطلبات، راجع البيانات، واعتمِد أو ارفض قبل تفعيل الحساب في النظام.',
                'Receive requests, review details, and approve or reject before accounts go live.',
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="summary-chip">
                {text('الإجمالي', 'Total')}: {summary.total}
              </span>
              <span className="summary-chip border-brandSecondary/25 bg-[rgba(0,158,219,0.06)] text-brandSecondary">
                {text('بانتظار المعالجة', 'Needs action')}: {summary.pending + summary.underReview}
              </span>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row lg:w-auto lg:flex-col">
            <button
              className="button-primary inline-flex items-center justify-center gap-2 px-5 py-3.5"
              disabled={!firstPending}
              onClick={() => {
                if (firstPending) {
                  openRequest(firstPending)
                }
              }}
              type="button"
            >
              <FileSearch className="h-4 w-4 shrink-0" />
              {text('مراجعة أول طلب معلّق', 'Review first pending')}
            </button>
            <button
              className="button-secondary inline-flex items-center justify-center gap-2 px-5 py-3.5"
              onClick={() => setSearch('')}
              type="button"
            >
              <ClipboardSignature className="h-4 w-4 shrink-0" />
              {text('مسح البحث', 'Clear search')}
            </button>
          </div>
        </div>
      </motion.section>

      {/* Stats + pipeline */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <motion.div
          className="rounded-2xl border border-slateAdmin-200 bg-white p-5 shadow-[0_4px_24px_rgba(26,42,58,0.05)]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slateAdmin-500">
              {text('كل الطلبات', 'All requests')}
            </p>
            <Inbox className="h-5 w-5 text-brandSecondary/80" />
          </div>
          <p className="mt-3 font-display text-3xl font-bold tabular-nums text-slateAdmin-950">{summary.total}</p>
        </motion.div>
        {pipelineSteps.map((step, index) => (
          <motion.div
            key={step.key}
            className="rounded-2xl border border-slateAdmin-200 bg-white p-5 shadow-[0_4px_24px_rgba(26,42,58,0.05)]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + index * 0.04 }}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slateAdmin-500">{step.label}</p>
              <step.icon className="h-5 w-5 text-slateAdmin-400" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold tabular-nums text-slateAdmin-950">{step.count}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <section className="toolbar-panel">
        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.85fr_0.85fr]">
          <label className="relative block">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slateAdmin-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={text(
                'ابحث بالاسم، البريد، التخصص، العيادة، أو رقم الطلب…',
                'Search by name, email, specialty, clinic, or request ID…',
              )}
              className="field-input pr-12"
              type="search"
              autoComplete="off"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="field-select"
          >
            <option value="all">{text('كل الحالات', 'All statuses')}</option>
            <option value="pending">{statusLabels.pending}</option>
            <option value="under_review">{statusLabels.under_review}</option>
            <option value="approved">{statusLabels.approved}</option>
            <option value="rejected">{statusLabels.rejected}</option>
          </select>

          <select
            value={specialtyFilter}
            onChange={(event) => setSpecialtyFilter(event.target.value)}
            className="field-select"
          >
            <option value="all">{text('كل التخصصات', 'All specialties')}</option>
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>
      </section>

      <DataTable columns={tableColumns} minWidthClassName="min-w-[1100px]">
        {filteredRequests.length === 0 ? (
          <TableEmptyState
            colSpan={tableColumns.length}
            title={text('لا توجد طلبات مطابقة', 'No matching requests')}
            description={text(
              'جرّب تغيير الفلاتر أو مصطلح البحث، أو انتظر وصول طلبات جديدة من بوابة الأطباء.',
              'Try adjusting filters or search, or wait for new requests from the doctor portal.',
            )}
          />
        ) : (
          filteredRequests.map((request) => (
            <tr key={request.request_id}>
              <td>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-slateAdmin-200 bg-slateAdmin-50 p-3 text-slateAdmin-700">
                    <UserRoundPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slateAdmin-950">{request.full_name}</p>
                    <p className="mt-1 font-mono text-xs text-slateAdmin-500">{request.request_id}</p>
                  </div>
                </div>
              </td>
              <td>
                <p className="font-semibold text-slateAdmin-900">{request.specialty}</p>
                <p className="mt-1 text-xs text-slateAdmin-500">{request.clinic_name}</p>
              </td>
              <td>
                <p className="font-semibold text-slateAdmin-900">{request.email}</p>
                <p className="mt-1 text-xs text-slateAdmin-500">{request.phone}</p>
              </td>
              <td>
                <div className="space-y-2">
                  <StatusPill tone={statusTone[request.status]} label={statusLabels[request.status]} />
                  <p className="text-xs text-slateAdmin-500">{request.source_app}</p>
                </div>
              </td>
              <td>
                <p className="font-semibold text-slateAdmin-900">{formatDate(request.submitted_at)}</p>
                <p className="mt-1 text-xs text-slateAdmin-500">
                  {request.reviewed_at
                    ? text(`تمت المراجعة: ${formatDate(request.reviewed_at)}`, `Reviewed: ${formatDate(request.reviewed_at)}`)
                    : text('لم تتم المراجعة بعد', 'Not reviewed yet')}
                </p>
              </td>
              <td>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="button-secondary px-4 py-2.5 text-sm"
                    onClick={() => openRequest(request)}
                    type="button"
                  >
                    {text('عرض', 'View')}
                  </button>
                  {request.status !== 'approved' ? (
                    <button
                      className="button-primary px-4 py-2.5 text-sm"
                      onClick={() => setDoctorSignupRequestStatus(request.request_id, 'approved')}
                      type="button"
                    >
                      {text('قبول', 'Approve')}
                    </button>
                  ) : null}
                  {request.status !== 'rejected' ? (
                    <button
                      className="button-danger px-4 py-2.5 text-sm"
                      onClick={() => setDoctorSignupRequestStatus(request.request_id, 'rejected')}
                      type="button"
                    >
                      {text('رفض', 'Reject')}
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))
        )}
      </DataTable>

      <Modal
        open={Boolean(selectedRequest)}
        title={text('مراجعة طلب إنشاء حساب طبيب', 'Review doctor signup request')}
        onClose={closeModal}
        footer={
          <>
            <button className="button-secondary" onClick={closeModal} type="button">
              {text('إغلاق', 'Close')}
            </button>
            <button className="button-secondary" onClick={() => submitDecision('under_review')} type="button">
              <Clock3 className="h-4 w-4" />
              {text('تحويل للمراجعة', 'Mark under review')}
            </button>
            <button className="button-danger" onClick={() => submitDecision('rejected')} type="button">
              <XCircle className="h-4 w-4" />
              {text('رفض', 'Reject')}
            </button>
            <button className="button-primary" onClick={() => submitDecision('approved')} type="button">
              <CheckCircle2 className="h-4 w-4" />
              {text('قبول', 'Approve')}
            </button>
          </>
        }
      >
        {selectedRequest ? (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="dashboard-panel p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-slateAdmin-200 bg-slateAdmin-50 p-3 text-slateAdmin-700">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-slateAdmin-500">{text('المتقدّم', 'Applicant')}</p>
                    <p className="mt-1 text-xl font-bold text-slateAdmin-950">{selectedRequest.full_name}</p>
                  </div>
                </div>
              </div>

              <div className="dashboard-panel p-5">
                <p className="text-sm text-slateAdmin-500">{text('الحالة الحالية', 'Current status')}</p>
                <div className="mt-3">
                  <StatusPill
                    tone={statusTone[selectedRequest.status]}
                    label={statusLabels[selectedRequest.status]}
                  />
                </div>
              </div>

              <div className="dashboard-panel p-5">
                <p className="text-sm text-slateAdmin-500">{text('البريد الإلكتروني', 'Email')}</p>
                <p className="mt-2 break-all text-lg font-bold text-slateAdmin-950">{selectedRequest.email}</p>
              </div>

              <div className="dashboard-panel p-5">
                <p className="text-sm text-slateAdmin-500">{text('الهاتف', 'Phone')}</p>
                <p className="mt-2 text-lg font-bold text-slateAdmin-950">{selectedRequest.phone}</p>
              </div>

              <div className="dashboard-panel p-5">
                <p className="text-sm text-slateAdmin-500">{text('التخصص', 'Specialty')}</p>
                <p className="mt-2 text-lg font-bold text-slateAdmin-950">{selectedRequest.specialty}</p>
              </div>

              <div className="dashboard-panel p-5">
                <p className="text-sm text-slateAdmin-500">{text('العيادة', 'Clinic')}</p>
                <p className="mt-2 text-lg font-bold text-slateAdmin-950">{selectedRequest.clinic_name}</p>
              </div>

              <div className="dashboard-panel p-5">
                <p className="text-sm text-slateAdmin-500">{text('الدور المطلوب', 'Requested role')}</p>
                <p className="mt-2 text-lg font-bold text-slateAdmin-950">{selectedRequest.requested_role}</p>
              </div>

              <div className="dashboard-panel p-5">
                <p className="text-sm text-slateAdmin-500">{text('مصدر الطلب', 'Source')}</p>
                <p className="mt-2 text-lg font-bold text-slateAdmin-950">{selectedRequest.source_app}</p>
              </div>

              <div className="dashboard-panel p-5">
                <p className="text-sm text-slateAdmin-500">{text('آخر مراجع', 'Last reviewer')}</p>
                <p className="mt-2 text-lg font-bold text-slateAdmin-950">
                  {selectedRequest.reviewed_by ?? text('لم تتم المراجعة بعد', 'Not reviewed yet')}
                </p>
              </div>
            </div>

            <div className="dashboard-panel p-5">
              <p className="text-sm text-slateAdmin-500">{text('ملاحظة المراجعة', 'Review note')}</p>
              <textarea
                value={reviewNote}
                onChange={(event) => setReviewNote(event.target.value)}
                placeholder={text(
                  'ملاحظة داخلية تُحفظ مع الطلب…',
                  'Internal note stored with the request…',
                )}
                className="mt-3 min-h-[132px] w-full rounded-2xl border border-slateAdmin-200 bg-white/95 px-4 py-4 text-slateAdmin-900 outline-none transition duration-200 placeholder:text-slateAdmin-400 focus:border-brandSecondary focus:ring-4 focus:ring-[rgba(0,158,219,0.15)]"
              />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
