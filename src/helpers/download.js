const simpleGit = require('simple-git');

const fsHelper = require('./fs.js');

const AVAILABLE_COMPONENTS = [
  {
    name: 'Gateway',
    slug: 'gateway',
    description: 'Gateway',
    httpCloneUrl: 'https://github.com/subenshi/gateway.git',
    sshCloneUrl: 'git@github.com:subenshi/gateway.git',
  },
  {
    name: 'Logger',
    slug: 'logger',
    description: 'Logger',
    httpCloneUrl: 'https://github.com/subenshi/logger.git',
    sshCloneUrl: 'git@github.com:subenshi/logger.git',
  },
  {
    name: 'Template',
    slug: 'template',
    description: 'Template',
    httpCloneUrl: 'https://github.com/subenshi/template.git',
    sshCloneUrl: 'git@github.com:subenshi/template.git',
  },
  {
    name: 'Admin',
    slug: 'admin',
    description: 'Admin dashboard',
    httpCloneUrl: 'https://github.com/subenshi/admin.git',
    sshCloneUrl: 'git@github.com:subenshi/admin.git',
  },
  {
    name: 'Angular',
    slug: 'angular',
    description: 'Angular application',
    httpCloneUrl: 'https://github.com/subenshi/angular.git',
    sshCloneUrl: 'git@github.com:subenshi/angular.git',
  }
]

const status = (gitPath, silentFail) => {
  try {
    const git = simpleGit(gitPath)
    return git.status()
  }
  catch (ex) {
    if (!silentFail) throw ex
    return {}
  }
}

const clone = (cloneUrl, path) => {
  const git = simpleGit()
  
  return git.clone(cloneUrl, path)
}

const components = list => {
  const toClone = list.map(component => {
    return AVAILABLE_COMPONENTS.find(availableComponent => availableComponent.slug === component)
  })

  let clonnedResults = []

  for(const component of toClone) {
    clonnedResults = clone(component.sshCloneUrl, fsHelper.project([component.slug]))
  }

  return clonnedResults;
}

module.exports.status = status
module.exports.components = components