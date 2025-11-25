targetScope = 'subscription'

@description('Deployment location')
param location string

@description('Resource group name')
param resourceGroupName string

@description('Container Registry name')
param containerRegistryName string

@description('Container App name')
param containerAppName string

@description('Container image name (repository)')
param containerImageName string

@description('Container image tag')
@allowed([
  'latest'
])
param containerImageTag string

@description('When true, run an ACR Build during deployment and use its output image tag')
param doBuild bool

@description('Git source URL for ACR build (e.g., https://github.com/org/repo.git#main). Required when doBuild=true')
param sourceRepoUrl string

// Create Resource Group
module rg 'rg.bicep' = {
  name: 'rg-azure-release-mapper'
  params: {
    location: location
    resourceGroupName: resourceGroupName
  }
}

// Deploy ACR into RG
module acr 'acr.bicep' = {
  name: 'acr-azure-release-mapper'
  scope: resourceGroup(resourceGroupName)
  dependsOn: [ rg ]
  params: {
    location: location
    containerRegistryName: containerRegistryName
  }
}

// Optional: Build and push image to ACR via cloud build (ACR Build) using sourceRepoUrl
module build 'build-image.bicep' = if (doBuild) {
  name: 'build-azure-image'
  scope: resourceGroup(resourceGroupName)
  dependsOn: [ acr ]
  params: {
    location: location
    containerRegistryName: containerRegistryName
    containerImageName: containerImageName
    containerImageTag: containerImageTag
    sourceRepoUrl: sourceRepoUrl
  }
}

var imageRef = doBuild ? build.outputs.builtImage : '${containerRegistryName}.azurecr.io/${containerImageName}:${containerImageTag}'

// Deploy Container App + environment
module app 'containerapp.bicep' = {
  name: 'ca-azure-release-mapper'
  scope: resourceGroup(resourceGroupName)
  dependsOn: doBuild ? [ rg, acr, build ] : [ rg, acr ]
  params: {
    location: location
    containerAppName: containerAppName
    containerImage: imageRef
    containerRegistryServer: '${containerRegistryName}.azurecr.io'
    containerRegistryName: containerRegistryName
  }
}
