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

// Create Resource Group
module rg 'rg.bicep' = {
  name: 'rg-cloudops-release-mapper'
  params: {
    location: location
    resourceGroupName: resourceGroupName
  }
}

// Deploy ACR into RG
module acr 'acr.bicep' = {
  name: 'acr-cloudops-release-mapper'
  scope: resourceGroup(resourceGroupName)
  dependsOn: [ rg ]
  params: {
    location: location
    containerRegistryName: containerRegistryName
  }
}

// Deploy Container App + environment
module app 'containerapp.bicep' = {
  name: 'ca-cloudops-release-mapper'
  scope: resourceGroup(resourceGroupName)
  dependsOn: [ rg, acr ]
  params: {
    location: location
    containerAppName: containerAppName
    containerImage: '${containerRegistryName}.azurecr.io/${containerImageName}:latest'
    containerRegistryServer: '${containerRegistryName}.azurecr.io'
    containerRegistryName: containerRegistryName
  }
}
