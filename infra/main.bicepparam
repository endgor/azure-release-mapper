using 'main.bicep'

param location = 'westeurope'
param containerAppName = 'ca-cloudops-release-mapper'
param containerImageName = 'cloudops-release-mapper'
param containerImageTag = 'latest'
param containerRegistryName = 'acrcloudopsreleasemapper'
param resourceGroupName = 'rg-cloudops-release-mapper'

// Set to true to let the Bicep deployment run an ACR Build using sourceRepoUrl. Requires your repo to be accessible.
param doBuild = true

// Provide a Git URL (public or with token) for ACR Build. Example: 'https://github.com/your-org/cloudops-release-mapper.git#main'
param sourceRepoUrl = 'https://github.com/endgor/cloudops-release-mapper.git#main'
