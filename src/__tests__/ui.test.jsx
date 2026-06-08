import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PageHeader, Card, Field, Input, Textarea, Select, Toggle, Button, SaveBar, Spinner, ErrorMsg } from '../components/ui'

describe('ui primitives', () => {
  it('PageHeader renders title and description', () => {
    render(<PageHeader title="Mi título" description="Una descripción" />)
    expect(screen.getByText('Mi título')).toBeInTheDocument()
    expect(screen.getByText('Una descripción')).toBeInTheDocument()
  })

  it('PageHeader renders without description', () => {
    render(<PageHeader title="Solo título" />)
    expect(screen.getByText('Solo título')).toBeInTheDocument()
  })

  it('Card renders children', () => {
    render(<Card><span>contenido de tarjeta</span></Card>)
    expect(screen.getByText('contenido de tarjeta')).toBeInTheDocument()
  })

  it('Field renders label and children', () => {
    render(
      <Field label="Etiqueta">
        <input defaultValue="valor" />
      </Field>
    )
    expect(screen.getByText('Etiqueta')).toBeInTheDocument()
  })

  it('Field shows hint when provided', () => {
    render(
      <Field label="Campo" hint="Ayuda aquí">
        <input />
      </Field>
    )
    expect(screen.getByText('Ayuda aquí')).toBeInTheDocument()
  })

  it('Toggle calls onChange with inverted value when clicked', () => {
    const onChange = vi.fn()
    render(<Toggle checked={false} onChange={onChange} label="Activo" />)
    // Toggle track div is the sibling before label text span
    const track = screen.getByText('Activo').previousSibling
    fireEvent.click(track)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('Toggle calls onChange with false when currently true', () => {
    const onChange = vi.fn()
    render(<Toggle checked={true} onChange={onChange} label="Activo" />)
    const track = screen.getByText('Activo').previousSibling
    fireEvent.click(track)
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('Button renders children and handles click', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Guardar</Button>)
    fireEvent.click(screen.getByText('Guardar'))
    expect(onClick).toHaveBeenCalled()
  })

  it('Button renders secondary variant', () => {
    render(<Button variant="secondary">Cancelar</Button>)
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })

  it('Button renders danger variant', () => {
    render(<Button variant="danger">Eliminar</Button>)
    expect(screen.getByText('Eliminar')).toBeInTheDocument()
  })

  it('SaveBar shows guardado when saved is true', () => {
    render(<SaveBar saving={false} saved={true} onSave={vi.fn()} />)
    expect(screen.getByText('¡Guardado!')).toBeInTheDocument()
  })

  it('SaveBar calls onSave when button clicked', () => {
    const onSave = vi.fn()
    render(<SaveBar saving={false} saved={false} onSave={onSave} />)
    fireEvent.click(screen.getByText('Guardar cambios'))
    expect(onSave).toHaveBeenCalled()
  })

  it('Spinner renders the spinning element', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('ErrorMsg renders the message', () => {
    render(<ErrorMsg message="Error de red" />)
    expect(screen.getByText('Error de red')).toBeInTheDocument()
  })

  it('Select renders all options', () => {
    const opts = [
      { value: 'a', label: 'Opción A' },
      { value: 'b', label: 'Opción B' },
    ]
    render(<Select options={opts} />)
    expect(screen.getByText('Opción A')).toBeInTheDocument()
    expect(screen.getByText('Opción B')).toBeInTheDocument()
  })

  it('Input passes through props', () => {
    render(<Input placeholder="Escribe aquí" defaultValue="texto" />)
    expect(screen.getByPlaceholderText('Escribe aquí')).toBeInTheDocument()
    expect(screen.getByDisplayValue('texto')).toBeInTheDocument()
  })

  it('Textarea passes through props', () => {
    render(<Textarea placeholder="Descripción" />)
    expect(screen.getByPlaceholderText('Descripción')).toBeInTheDocument()
  })
})
