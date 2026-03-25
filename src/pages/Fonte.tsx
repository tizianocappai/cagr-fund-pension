import * as React from 'react'
import { CagrCalculator } from '@/components/CagrCalculator'
import { columnsByProvider } from '@/lib/providerConfig'
import { Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { clearFile, loadFile, saveFile } from '@/lib/fileStorage'
import { parseFonte } from '@/lib/parseFonte'

const { Dragger } = Upload

export default function Fonte() {
  const [file, setFile] = React.useState<File | null>(null)
  const [restoring, setRestoring] = React.useState(true)

  React.useEffect(() => {
    loadFile('fonte')
      .then(f => { if (f) { setFile(f) } })
      .catch(() => {})
      .finally(() => setRestoring(false))
  }, [])

  async function handleFileSelect(f: File) {
    setFile(f)
    await saveFile(f, 'fonte').catch(() => {})
  }

  async function handleClear() {
    setFile(null)
    await clearFile('fonte').catch(() => {})
  }

  if (restoring) return null

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">

      <header className="mb-8">
        <h1 className="text-[36px] leading-[44px] font-normal">Fondo Fonte</h1>
        <p className="mt-2 text-muted-foreground">
          Carica il file XLS esportato dal portale del fondo pensione Fonte.
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

      {file && <CagrCalculator file={file} flow="fonte" parser={parseFonte} columns={columnsByProvider['fonte']} />}

    </div>
  )
}
