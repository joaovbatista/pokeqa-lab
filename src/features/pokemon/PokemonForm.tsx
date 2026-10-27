import { useEffect, useRef, useState, type FormEvent } from 'react'
import { GENERATIONS, POKEMON_TYPES, RARITIES, RARITY_LABELS, STATUSES, STATUS_LABELS, TYPE_LABELS } from '../../config/constants'
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, isSupabaseConfigured } from '../../config/env'
import { Field } from '../../components/Field'
import { AppError } from '../../services/errors'
import { createPokemon, getPokemon, updatePokemon } from '../../services/pokemonService'
import { uploadImage, validateImageFile } from '../../services/storageService'
import { applyPokeApi, EMPTY_FORM, formToInput, recordToForm, validatePokemon, type FormErrors, type PokemonFormValues } from '../../validation/pokemon'
import type { PokemonRecord } from '../../types'
import { PokeApiSearch } from './PokeApiSearch'

interface Props {
  record: PokemonRecord | null
  onSaved: (saved: PokemonRecord, created: boolean) => void
  onCancel: () => void
}

export function PokemonForm({ record, onSaved, onCancel }: Props) {
  const [base, setBase] = useState<PokemonRecord | null>(record)
  const [values, setValues] = useState<PokemonFormValues>(record ? recordToForm(record) : EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<AppError | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const savingRef = useRef(false)
  const uploadCtrl = useRef<AbortController | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const set = <K extends keyof PokemonFormValues>(k: K, v: PokemonFormValues[K]) => {
    setValues((s) => ({ ...s, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  function onPickFile(f: File | null) {
    if (preview) URL.revokeObjectURL(preview)
    setFileError(null)
    if (!f) { setFile(null); setPreview(null); return }
    const problem = validateImageFile(f)
    if (problem) {
      setFile(null); setPreview(null); setFileError(problem)
      if (fileInput.current) fileInput.current.value = ''
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function clearFile() {
    onPickFile(null)
    if (fileInput.current) fileInput.current.value = ''
  }

  async function reloadCurrent() {
    if (!base) return
    try {
      const fresh = await getPokemon(base.id)
      setBase(fresh)
      setValues(recordToForm(fresh))
      setFormError(null)
    } catch (e) {
      setFormError(e instanceof AppError ? e : new AppError('unknown', 'Não foi possível recarregar o registro.'))
    }
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault()
    if (savingRef.current) return // bloqueia envio duplo
    const errs = validatePokemon(values)
    setErrors(errs)
    if (Object.keys(errs).length > 0) { setFormError(null); return }
    savingRef.current = true
    setSaving(true)
    setFormError(null)
    try {
      let imageUrl = values.image_url
      if (file) {
        uploadCtrl.current = new AbortController()
        imageUrl = await uploadImage(file, uploadCtrl.current.signal)
      }
      const input = formToInput({ ...values, image_url: imageUrl })
      const saved = base ? await updatePokemon(base.id, input, base.updated_at) : await createPokemon(input)
      onSaved(saved, !base)
    } catch (e) {
      setFormError(e instanceof AppError ? e : new AppError('unknown', e instanceof Error ? e.message : 'Erro inesperado.'))
    } finally {
      savingRef.current = false
      setSaving(false)
      uploadCtrl.current = null
    }
  }

  const text = (k: keyof PokemonFormValues) => values[k] as string
  const statFields: [keyof PokemonFormValues, string][] = [
    ['hp', 'HP'], ['attack', 'Ataque'], ['defense', 'Defesa'], ['sp_attack', 'Ataque especial'], ['sp_defense', 'Defesa especial'], ['speed', 'Velocidade'],
  ]

  return (
    <div>
      {!base && <PokeApiSearch onUse={(p) => { setValues((s) => applyPokeApi(s, p)); setErrors({}) }} />}

      <form onSubmit={submit} noValidate aria-label={base ? 'Editar Pokémon' : 'Novo Pokémon'} data-testid="pokemon-form">
        {formError && (
          <div role="alert" className="callout callout-error" data-testid="form-error">
            <span>{formError.message}</span>
            {formError.kind === 'conflict' && (
              <button type="button" className="btn btn-sm" onClick={() => void reloadCurrent()} data-testid="reload-current">Carregar versão atual</button>
            )}
          </div>
        )}
        {Object.keys(errors).length > 0 && (
          <div role="alert" className="callout callout-error" data-testid="form-summary">Corrija os campos destacados antes de salvar.</div>
        )}
        <p className="muted" data-testid="form-source">
          Origem do registro: {values.source === 'pokeapi' ? 'preenchido com dados da PokéAPI' : 'registro personalizado'}
        </p>

        <div className="grid grid-3">
          <Field label="Número da Pokédex" required error={errors.pokedex_number} testId="pokedex_number">
            {({ id, describedBy, invalid }) => (
              <input id={id} name="pokedex_number" type="number" min={1} max={2000} value={text('pokedex_number')}
                onChange={(e) => set('pokedex_number', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />
            )}
          </Field>
          <Field label="Nome" required error={errors.name} testId="name">
            {({ id, describedBy, invalid }) => (
              <input id={id} name="name" type="text" maxLength={60} value={values.name}
                onChange={(e) => set('name', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />
            )}
          </Field>
          <Field label="Apelido" error={errors.nickname} hint="Até 30 caracteres" testId="nickname">
            {({ id, describedBy, invalid }) => (
              <input id={id} name="nickname" type="text" value={values.nickname}
                onChange={(e) => set('nickname', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />
            )}
          </Field>
          <Field label="Tipo primário" required error={errors.primary_type} testId="primary_type">
            {({ id, describedBy, invalid }) => (
              <select id={id} name="primary_type" value={values.primary_type}
                onChange={(e) => set('primary_type', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy}>
                <option value="">Selecione</option>
                {POKEMON_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            )}
          </Field>
          <Field label="Tipo secundário" error={errors.secondary_type} testId="secondary_type">
            {({ id, describedBy, invalid }) => (
              <select id={id} name="secondary_type" value={values.secondary_type}
                onChange={(e) => set('secondary_type', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy}>
                <option value="">Nenhum</option>
                {POKEMON_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            )}
          </Field>
          <Field label="Espécie" error={errors.species} testId="species">
            {({ id, describedBy, invalid }) => (
              <input id={id} name="species" type="text" value={values.species}
                onChange={(e) => set('species', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />
            )}
          </Field>
          <Field label="Altura (m)" error={errors.height_m} testId="height_m">
            {({ id, describedBy, invalid }) => (
              <input id={id} name="height_m" type="number" step="0.01" min={0} max={100} value={values.height_m}
                onChange={(e) => set('height_m', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />
            )}
          </Field>
          <Field label="Peso (kg)" error={errors.weight_kg} testId="weight_kg">
            {({ id, describedBy, invalid }) => (
              <input id={id} name="weight_kg" type="number" step="0.01" min={0} max={10000} value={values.weight_kg}
                onChange={(e) => set('weight_kg', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />
            )}
          </Field>
          <Field label="Nível" required error={errors.level} hint="1 a 100" testId="level">
            {({ id, describedBy, invalid }) => (
              <input id={id} name="level" type="number" min={1} max={100} value={values.level}
                onChange={(e) => set('level', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />
            )}
          </Field>
        </div>

        <fieldset className="grid grid-3" data-testid="stats-fieldset">
          <legend>Atributos base (1 a 255)</legend>
          {statFields.map(([k, label]) => (
            <Field key={k} label={label} required error={errors[k]} testId={k}>
              {({ id, describedBy, invalid }) => (
                <input id={id} name={k} type="number" min={1} max={255} value={text(k)}
                  onChange={(e) => set(k, e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />
              )}
            </Field>
          ))}
        </fieldset>

        <div className="grid grid-3">
          <Field label="Geração" required error={errors.generation} testId="generation">
            {({ id, describedBy, invalid }) => (
              <select id={id} name="generation" value={values.generation}
                onChange={(e) => set('generation', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy}>
                {GENERATIONS.map((g) => <option key={g} value={g}>Geração {g}</option>)}
              </select>
            )}
          </Field>
          <Field label="Status" required testId="status">
            {({ id }) => (
              <select id={id} name="status" value={values.status} onChange={(e) => set('status', e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            )}
          </Field>
          <Field label="Raridade" required testId="rarity">
            {({ id }) => (
              <select id={id} name="rarity" value={values.rarity} onChange={(e) => set('rarity', e.target.value)}>
                {RARITIES.map((r) => <option key={r} value={r}>{RARITY_LABELS[r]}</option>)}
              </select>
            )}
          </Field>
          <Field label="Data de captura" error={errors.captured_at} testId="captured_at">
            {({ id, describedBy, invalid }) => (
              <input id={id} name="captured_at" type="date" value={values.captured_at}
                onChange={(e) => set('captured_at', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />
            )}
          </Field>
          <Field label="Data e hora de registro" hint="Definida automaticamente pelo banco" testId="registered_at">
            {({ id, describedBy }) => (
              <input id={id} type="text" readOnly aria-describedby={describedBy}
                value={base ? new Date(base.registered_at).toLocaleString('pt-BR') : 'Gerada ao salvar'} />
            )}
          </Field>
          <div className="field checkbox-field">
            <label className="check">
              <input type="checkbox" name="is_favorite" checked={values.is_favorite}
                onChange={(e) => set('is_favorite', e.target.checked)} data-testid="input-is_favorite" />
              Favorito
            </label>
          </div>
        </div>

        <Field label="Observações" error={errors.notes} hint={`${values.notes.length}/500 caracteres`} testId="notes">
          {({ id, describedBy, invalid }) => (
            <textarea id={id} name="notes" rows={3} value={values.notes}
              onChange={(e) => set('notes', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />
          )}
        </Field>

        <fieldset data-testid="image-fieldset">
          <legend>Imagem</legend>
          <div className="grid grid-2">
            <Field label="URL da imagem" error={errors.image_url} testId="image_url">
              {({ id, describedBy, invalid }) => (
                <input id={id} name="image_url" type="url" value={values.image_url} disabled={Boolean(file)}
                  onChange={(e) => set('image_url', e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />
              )}
            </Field>
            <Field label="Enviar arquivo de imagem" error={fileError ?? undefined}
              hint={`PNG, JPG, WEBP ou GIF até ${MAX_UPLOAD_BYTES / 1024 / 1024} MB`} testId="image_file">
              {({ id, describedBy, invalid }) => (
                <input id={id} ref={fileInput} type="file" accept={ALLOWED_IMAGE_TYPES.join(',')}
                  onChange={(e) => onPickFile(e.target.files?.[0] ?? null)} aria-invalid={invalid} aria-describedby={describedBy} />
              )}
            </Field>
          </div>
          {!isSupabaseConfigured && <p className="muted">Upload indisponível: Supabase Storage não está configurado. Use a URL da imagem.</p>}
          {(preview || values.image_url) && !errors.image_url && (
            <div className="preview" data-testid="image-preview">
              <img src={preview ?? values.image_url} alt="Pré-visualização da imagem do Pokémon" width={96} height={96} />
              <div>
                {file && <p className="muted">{file.name} ({Math.ceil(file.size / 1024)} KB)</p>}
                <button type="button" className="btn btn-sm" data-testid="image-remove"
                  onClick={() => { clearFile(); set('image_url', '') }}>Remover imagem</button>
              </div>
            </div>
          )}
        </fieldset>

        <div className="actions">
          {saving && file && (
            <button type="button" className="btn" onClick={() => uploadCtrl.current?.abort()} data-testid="upload-cancel">Cancelar upload</button>
          )}
          <button type="button" className="btn" onClick={onCancel} data-testid="form-cancel">Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={saving} aria-busy={saving} data-testid="form-submit">
            {saving ? 'Salvando…' : base ? 'Salvar alterações' : 'Cadastrar Pokémon'}
          </button>
        </div>
      </form>
    </div>
  )
}
