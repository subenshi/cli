const DO_NOT_WATCH_FOR = [
  'admin', 'angular'
]

const ecosystem = components => {
  return {
    apps: components.map(c => {
      return {
        name: c.name,
        cwd: c.path,
        script: 'npm',
        args: 'run run-from-cli',
        instances: 1,
        merge_logs: true,
        autorestart: false,
        watch: !DO_NOT_WATCH_FOR.includes(c.name),
      }
    })
  }
}

module.exports.ecosystem = ecosystem