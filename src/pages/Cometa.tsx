import * as React from 'react'
import { Link } from 'react-router'
import { CagrCalculator } from '@/components/CagrCalculator'
import { columnsByProvider } from '@/lib/providerConfig'
import { Alert, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { clearFile, loadFile, saveFile } from '@/lib/fileStorage'

const { Dragger } = Upload

export default function Cometa() {
  const [file, setFile] = React.useState<File | null>(null)
  const [restoring, setRestoring] = React.useState(true)

  React.useEffect(() => {
    loadFile('cometa')
      .then(f => { if (f) { setFile(f) } })
      .catch(() => {})
      .finally(() => setRestoring(false))
  }, [])

  async function handleFileSelect(f: File) {
    setFile(f)
    await saveFile(f, 'cometa').catch(() => {})
  }

  async function handleClear() {
    setFile(null)
    await clearFile('cometa').catch(() => {})
  }

  if (restoring) return null

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">

      <Alert
        type="info"
        showIcon
        className="mb-6"
        description={
          <>
            Prima volta? Leggi la{' '}
            <Link to="/cometa-guide">guida passo passo</Link>{' '}
            per sapere come esportare il file dal portale Fondo Cometa.
          </>
        }
      />

      <header className="mb-8">
        <h1 className="text-[36px] leading-[44px] font-normal">Fondo Cometa</h1>
        <p className="mt-2 text-muted-foreground">
          Carica il file XLS esportato dal portale del fondo pensione Cometa.
        </p>
      </header>

      <Dragger
        accept=".xls,.xlsx"
        maxCount={1}
        fileList={file ? [{
          uid: '-1',
          name: file.name,
          status: 'done',
          size: file.size,
        }] : []}
        beforeUpload={(uploadFile) => {
          handleFileSelect(uploadFile as File)
          return false
        }}
        onRemove={() => {
          handleClear()
          return true
        }}
        className={file ? 'py-6' : undefined}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Trascina qui il file o clicca per sfogliare</p>
        <p className="ant-upload-hint">.xls, .xlsx</p>
      </Dragger>

      {file && <CagrCalculator file={file} flow="cometa" columns={columnsByProvider['cometa']} />}

    </div>
  )
}
