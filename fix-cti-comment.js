import fs from 'fs'
import path from 'path'

function fixCommentInIndexFile(filePath) {
  if (!fs.existsSync(filePath)) return

  let content = fs.readFileSync(filePath, 'utf8')
  const header = `// ${filePath.replace(/\\/g, '/')}`

  // Replace the CTI default comment
  content = content.replace(
    /^\/\/.*create-ts-index.*$/m,
    header
  )

  fs.writeFileSync(filePath, content)
  console.log(`Fixed comment: ${filePath}`)
}

function walk(dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      walk(fullPath)
    } else if (file === 'index.ts') {
      fixCommentInIndexFile(fullPath)
    }
  }
}

walk('./src')
