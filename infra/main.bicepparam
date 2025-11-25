using 'main.bicep'

param location = 'westeurope'
param containerAppName = 'ca-azure-release-mapper'
param containerImageName = 'azure-release-mapper'
param containerImageTag = 'latest'
param containerRegistryName = 'acrazurereleasemapper'
param resourceGroupName = 'rg-azure-release-mapper'

// Set to true to let the Bicep deployment run an ACR Build using sourceRepoUrl. Requires your repo to be accessible.
param doBuild = true

// Provide a Git URL (public or with token) for ACR Build. Example: 'https://github.com/your-org/azure-release-mapper.git#main'
param sourceRepoUrl = 'https://github.com/endgor/azure-release-mapper.git#main'
