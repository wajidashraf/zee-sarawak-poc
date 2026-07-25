import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceUrl =
  'https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/9469f09592ced973a3448cf66b6100b741b64c0d/releaseData/gbOpen/MYS/ADM1/geoBoundaries-MYS-ADM1_simplified.geojson'
const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
)
const outputPath = path.join(
  projectRoot,
  'src',
  'assets',
  'sarawak-boundary.geo.json',
)

const response = await fetch(sourceUrl)
if (!response.ok) {
  throw new Error(
    `Sarawak boundary download failed with status ${response.status}.`,
  )
}

const collection = await response.json()
const sarawak = collection.features?.find(
  (feature) => feature.properties?.shapeISO === 'MY-13',
)

if (!sarawak) {
  throw new Error('The Malaysia ADM1 dataset does not contain Sarawak (MY-13).')
}

const boundary = {
  type: 'FeatureCollection',
  attribution: {
    source: 'geoBoundaries',
    boundarySource: 'OpenStreetMap, Wambacher',
    license: 'Open Data Commons Open Database License 1.0',
    sourceUrl: 'https://www.geoboundaries.org/',
  },
  features: [sarawak],
}

await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(boundary)}\n`, 'utf8')
console.log(`Saved Sarawak boundary to ${outputPath}`)
