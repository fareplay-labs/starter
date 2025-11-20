// @ts-nocheck
export const ImageGeneratorButton = ({ label = 'Generate', disabled }: any) => (
  <button
    type="button"
    disabled={disabled}
    style={{
      padding: '6px 12px',
      borderRadius: '6px',
      border: '1px solid rgba(255,255,255,0.2)',
      background: 'rgba(255,255,255,0.05)',
      color: 'inherit',
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}
  >
    {label}
  </button>
)

export default ImageGeneratorButton
