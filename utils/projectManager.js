const fs = require('fs');
const path = require('path');

const PROJECT_FILE = path.join(__dirname, '..', 'projectData.json');

function loadProjectData() {
  try {
    if (!fs.existsSync(PROJECT_FILE)) {
      const initialData = { projects: {}, pendingApplications: {} };
      fs.writeFileSync(PROJECT_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const data = fs.readFileSync(PROJECT_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading project data:', error);
    return { projects: {}, pendingApplications: {} };
  }
}

function saveProjectData(data) {
  try {
    fs.writeFileSync(PROJECT_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving project data:', error);
    return false;
  }
}

function createProject(userId, projectInfo) {
  const data = loadProjectData();
  const projectId = Date.now().toString();
  
  data.projects[projectId] = {
    id: projectId,
    ownerId: userId,
    name: projectInfo.name,
    description: projectInfo.description,
    type: projectInfo.type,
    teammates: projectInfo.teammates || [],
    categoryId: null,
    channelIds: {
      chat: null,
      voice: null
    },
    createdAt: Date.now(),
    lastActivity: Date.now(),
    status: 'active'
  };
  
  saveProjectData(data);
  return projectId;
}

function getProject(projectId) {
  const data = loadProjectData();
  return data.projects[projectId] || null;
}

function getUserProject(userId) {
  const data = loadProjectData();
  return Object.values(data.projects).find(p => p.ownerId === userId && p.status === 'active');
}

function updateProject(projectId, updates) {
  const data = loadProjectData();
  if (data.projects[projectId]) {
    data.projects[projectId] = { ...data.projects[projectId], ...updates };
    saveProjectData(data);
    return true;
  }
  return false;
}

function addTeammate(projectId, userId) {
  const data = loadProjectData();
  const project = data.projects[projectId];
  
  if (project && !project.teammates.includes(userId)) {
    project.teammates.push(userId);
    saveProjectData(data);
    return true;
  }
  return false;
}

function updateLastActivity(projectId) {
  return updateProject(projectId, { lastActivity: Date.now() });
}

function getInactiveProjects(daysInactive = 15) {
  const data = loadProjectData();
  const cutoffTime = Date.now() - (daysInactive * 24 * 60 * 60 * 1000);
  
  return Object.values(data.projects).filter(p => 
    p.status === 'active' && p.lastActivity < cutoffTime
  );
}

function archiveProject(projectId) {
  return updateProject(projectId, { status: 'archived', archivedAt: Date.now() });
}

function savePendingApplication(userId, applicationData) {
  const data = loadProjectData();
  data.pendingApplications[userId] = {
    ...applicationData,
    userId,
    submittedAt: Date.now()
  };
  saveProjectData(data);
}

function getPendingApplication(userId) {
  const data = loadProjectData();
  return data.pendingApplications[userId] || null;
}

function deletePendingApplication(userId) {
  const data = loadProjectData();
  delete data.pendingApplications[userId];
  saveProjectData(data);
}

module.exports = {
  loadProjectData,
  saveProjectData,
  createProject,
  getProject,
  getUserProject,
  updateProject,
  addTeammate,
  updateLastActivity,
  getInactiveProjects,
  archiveProject,
  savePendingApplication,
  getPendingApplication,
  deletePendingApplication
};
