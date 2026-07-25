import { useEffect } from 'react'
import {
  divIcon,
  geoJSON,
  type DivIcon,
  type GeoJSONOptions,
} from 'leaflet'
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet'
import type { FeatureCollection, Geometry } from 'geojson'
import 'leaflet/dist/leaflet.css'
import sarawakBoundaryData from '../../assets/sarawak-boundary.geo.json'
import type { MappedProject } from './dashboardMetrics'

const sarawakBoundary =
  sarawakBoundaryData as unknown as FeatureCollection<Geometry>

const boundaryStyle: GeoJSONOptions['style'] = {
  color: '#174f78',
  fillColor: '#2563eb',
  fillOpacity: 0.035,
  opacity: 0.95,
  weight: 3,
}

const markerIcons: Record<MappedProject['health'], DivIcon> = {
  green: createMarkerIcon('green'),
  amber: createMarkerIcon('amber'),
  red: createMarkerIcon('red'),
}

interface ProjectMapProps {
  projects: MappedProject[]
  unmappedProjects: number
}

export function ProjectMap({
  projects,
  unmappedProjects,
}: ProjectMapProps) {
  return (
    <article aria-labelledby="project-map-heading" className="project-map-panel">
      <header className="project-map-panel__heading">
        <div>
          <p className="dashboard-panel__eyebrow">Geographic overview</p>
          <h2 id="project-map-heading">Projects across Sarawak</h2>
          <p>
            Hover over a pin for the project name, or select it for project and
            location details.
          </p>
        </div>
        <div aria-label="Project health legend" className="project-map-legend">
          <span className="project-map-legend__item">
            <i className="project-map-legend__dot project-map-legend__dot--green" />
            Green
          </span>
          <span className="project-map-legend__item">
            <i className="project-map-legend__dot project-map-legend__dot--amber" />
            Amber
          </span>
          <span className="project-map-legend__item">
            <i className="project-map-legend__dot project-map-legend__dot--red" />
            Red
          </span>
        </div>
      </header>

      <div className="project-map-panel__canvas">
        <MapContainer
          aria-label={`Interactive map of Sarawak showing ${projects.length} mapped projects`}
          attributionControl
          center={[2.5, 113.3]}
          className="project-map"
          keyboard
          scrollWheelZoom={false}
          zoom={7}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoJSON data={sarawakBoundary} style={boundaryStyle} />
          <FitSarawakBoundary />
          <KeepMapSized />

          {projects.map((project) => (
            <Marker
              alt={`${project.name}, ${project.healthLabel} health`}
              icon={markerIcons[project.health]}
              keyboard
              key={project.id}
              position={[project.latitude, project.longitude]}
              riseOnHover
              title={project.name}
            >
              <Tooltip direction="top" offset={[0, -12]} opacity={0.98}>
                {project.name}
              </Tooltip>
              <Popup>
                <div className="project-map-popup">
                  <strong>{project.name}</strong>
                  <span>
                    {project.locationName} · {project.division}
                  </span>
                  <span>
                    {project.healthLabel} health · {project.progress}% complete
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <footer className="project-map-panel__footer">
        <p aria-live="polite">
          <strong>{projects.length}</strong> mapped project
          {projects.length === 1 ? '' : 's'}
          {unmappedProjects > 0
            ? ` · ${unmappedProjects} without valid coordinates`
            : ''}
        </p>
        <p>
          Boundary: geoBoundaries (OpenStreetMap/Wambacher), ODbL 1.0.
        </p>
      </footer>

      {projects.length > 0 ? (
        <details className="project-map-data">
          <summary>View mapped projects as a table</summary>
          <div className="project-map-data__shell">
            <table>
              <caption className="sr-only">
                Projects displayed on the Sarawak map
              </caption>
              <thead>
                <tr>
                  <th scope="col">Project</th>
                  <th scope="col">Location</th>
                  <th scope="col">Health</th>
                  <th scope="col">Coordinates</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <th scope="row">{project.name}</th>
                    <td>
                      {project.locationName}, {project.division}
                    </td>
                    <td>{project.healthLabel}</td>
                    <td>
                      {project.latitude.toFixed(5)},{' '}
                      {project.longitude.toFixed(5)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}
    </article>
  )
}

function createMarkerIcon(health: MappedProject['health']) {
  return divIcon({
    className: `project-map-marker project-map-marker--${health}`,
    html: '<span aria-hidden="true"></span>',
    iconAnchor: [14, 14],
    iconSize: [28, 28],
    popupAnchor: [0, -16],
    tooltipAnchor: [0, -12],
  })
}

function FitSarawakBoundary() {
  const map = useMap()

  useEffect(() => {
    const bounds = geoJSON(sarawakBoundary).getBounds()
    map.fitBounds(bounds, {
      padding: [18, 18],
    })
  }, [map])

  return null
}

function KeepMapSized() {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(container)
    return () => observer.disconnect()
  }, [map])

  return null
}
