interface Props {
  disabled?: boolean
  onClick: () => void
}

export default function AnalyzeButton({ disabled, onClick }: Props) {
  return (
    <button className="btn btn-primary" onClick={onClick} disabled={disabled}>
      Analyze
    </button>
  )
}

