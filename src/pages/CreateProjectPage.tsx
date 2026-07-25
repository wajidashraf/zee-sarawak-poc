import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FormField } from '../components/ui/FormField'
import { ArrowLeftIcon } from '../components/ui/Icons'
import { PageHeader } from '../components/ui/PageHeader'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useContractors } from '../shared/hooks/useContractors'
import { useProjectLocations } from '../shared/hooks/useProjectLocations'
import { createProject } from '../shared/services/projectService'
import {
  PROJECT_HEALTH_LABELS,
  PROJECT_TYPE_LABELS,
  type ProjectHealth,
  type ProjectType,
} from '../types/project'

interface ProjectFormState {
  name: string
  type: ProjectType
  health: ProjectHealth
  plannedCompletionDate: string
  approvedBudget: string
  contractorId: string
  primaryContractorId: string
  locationId: string
}

const initialFormState: ProjectFormState = {
  name: '',
  type: 'infrastructure',
  health: 'green',
  plannedCompletionDate: '',
  approvedBudget: '',
  contractorId: '',
  primaryContractorId: '',
  locationId: '',
}

type FormErrors = Partial<Record<keyof ProjectFormState, string>>

export function CreateProjectPage() {
  useDocumentTitle('Create project')

  const navigate = useNavigate()
  const contractors = useContractors()
  const locations = useProjectLocations()
  const [form, setForm] = useState(initialFormState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = <Key extends keyof ProjectFormState>(
    key: Key,
    value: ProjectFormState[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const validate = () => {
    const nextErrors: FormErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Enter a project name.'
    if (!form.plannedCompletionDate) {
      nextErrors.plannedCompletionDate = 'Select a planned completion date.'
    }
    if (!form.contractorId) {
      nextErrors.contractorId = 'Select the required contractor.'
    }
    if (
      form.approvedBudget &&
      (!Number.isFinite(Number(form.approvedBudget)) ||
        Number(form.approvedBudget) < 0)
    ) {
      nextErrors.approvedBudget = 'Enter a budget of zero or more.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const project = await createProject({
        name: form.name,
        type: form.type,
        health: form.health,
        plannedCompletionDate: form.plannedCompletionDate,
        approvedBudget: form.approvedBudget
          ? Number(form.approvedBudget)
          : undefined,
        contractorId: form.contractorId,
        primaryContractorId: form.primaryContractorId || undefined,
        locationId: form.locationId || undefined,
      })
      navigate(`/projects/${project.id}`, { replace: true })
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'The project could not be created. Try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const lookupError = contractors.error ?? locations.error
  const lookupsLoading = contractors.isLoading || locations.isLoading

  return (
    <div className="page-container page-container--workspace">
      <Link className="back-link" to="/projects">
        <ArrowLeftIcon aria-hidden="true" height="18" width="18" />
        Back to projects
      </Link>

      <PageHeader
        description="Add the core delivery, contractor, and investment information needed to start monitoring a project."
        eyebrow="Portfolio administration"
        title="Create new project"
      />

      <form className="project-form" noValidate onSubmit={handleSubmit}>
        {lookupError ? (
          <div className="form-alert" role="alert">
            <strong>Reference data could not be loaded.</strong>
            <span>{lookupError}</span>
          </div>
        ) : null}
        {submitError ? (
          <div className="form-alert" role="alert">
            <strong>Project not created.</strong>
            <span>{submitError}</span>
          </div>
        ) : null}

        <section aria-labelledby="project-basics-heading" className="form-section">
          <div className="form-section__heading">
            <span>01</span>
            <div>
              <h2 id="project-basics-heading">Project basics</h2>
              <p>Define how the project appears across the portfolio.</p>
            </div>
          </div>
          <div className="form-grid">
            <FormField
              error={errors.name}
              id="project-name"
              label="Project name"
              required
            >
              <input
                aria-describedby={errors.name ? 'project-name-error' : undefined}
                aria-invalid={Boolean(errors.name)}
                id="project-name"
                maxLength={100}
                onChange={(event) => updateField('name', event.target.value)}
                value={form.name}
              />
            </FormField>
            <FormField id="project-type" label="Project type" required>
              <select
                id="project-type"
                onChange={(event) =>
                  updateField('type', event.target.value as ProjectType)
                }
                value={form.type}
              >
                {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField id="project-health" label="Initial health" required>
              <select
                id="project-health"
                onChange={(event) =>
                  updateField('health', event.target.value as ProjectHealth)
                }
                value={form.health}
              >
                {Object.entries(PROJECT_HEALTH_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              error={errors.plannedCompletionDate}
              id="planned-completion"
              label="Planned completion date"
              required
            >
              <input
                aria-describedby={
                  errors.plannedCompletionDate
                    ? 'planned-completion-error'
                    : undefined
                }
                aria-invalid={Boolean(errors.plannedCompletionDate)}
                id="planned-completion"
                onChange={(event) =>
                  updateField('plannedCompletionDate', event.target.value)
                }
                type="date"
                value={form.plannedCompletionDate}
              />
            </FormField>
          </div>
        </section>

        <section aria-labelledby="delivery-partners-heading" className="form-section">
          <div className="form-section__heading">
            <span>02</span>
            <div>
              <h2 id="delivery-partners-heading">Delivery partners</h2>
              <p>Connect the project to its contractor and location records.</p>
            </div>
          </div>
          <div className="form-grid">
            <FormField
              error={errors.contractorId}
              id="contractor"
              label="Contractor"
              required
            >
              <select
                aria-describedby={
                  errors.contractorId ? 'contractor-error' : undefined
                }
                aria-invalid={Boolean(errors.contractorId)}
                disabled={contractors.isLoading || Boolean(contractors.error)}
                id="contractor"
                onChange={(event) =>
                  updateField('contractorId', event.target.value)
                }
                value={form.contractorId}
              >
                <option value="">
                  {contractors.isLoading ? 'Loading contractors…' : 'Select contractor'}
                </option>
                {contractors.items.map((contractor) => (
                  <option key={contractor.id} value={contractor.id}>
                    {contractor.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              helperText="Optional. If omitted, the required contractor is shown as primary."
              id="primary-contractor"
              label="Primary contractor"
            >
              <select
                aria-describedby="primary-contractor-help"
                disabled={contractors.isLoading || Boolean(contractors.error)}
                id="primary-contractor"
                onChange={(event) =>
                  updateField('primaryContractorId', event.target.value)
                }
                value={form.primaryContractorId}
              >
                <option value="">Use required contractor</option>
                {contractors.items.map((contractor) => (
                  <option key={contractor.id} value={contractor.id}>
                    {contractor.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField id="project-location" label="Project location">
              <select
                disabled={locations.isLoading || Boolean(locations.error)}
                id="project-location"
                onChange={(event) =>
                  updateField('locationId', event.target.value)
                }
                value={form.locationId}
              >
                <option value="">
                  {locations.isLoading ? 'Loading locations…' : 'No location selected'}
                </option>
                {locations.items.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              error={errors.approvedBudget}
              helperText="Enter the approved amount in Malaysian ringgit."
              id="approved-budget"
              label="Approved budget (MYR)"
            >
              <input
                aria-describedby={
                  errors.approvedBudget
                    ? 'approved-budget-error'
                    : 'approved-budget-help'
                }
                aria-invalid={Boolean(errors.approvedBudget)}
                id="approved-budget"
                inputMode="decimal"
                min="0"
                onChange={(event) =>
                  updateField('approvedBudget', event.target.value)
                }
                step="0.01"
                type="number"
                value={form.approvedBudget}
              />
            </FormField>
          </div>
        </section>

        <div className="form-actions">
          <Link className="button button--secondary" to="/projects">
            Cancel
          </Link>
          <button
            className="button button--primary"
            disabled={isSubmitting || lookupsLoading || Boolean(lookupError)}
            type="submit"
          >
            {isSubmitting ? 'Creating project…' : 'Create project'}
          </button>
        </div>
      </form>
    </div>
  )
}
