targetScope = 'resourceGroup'

@description('Container Registry name')
param containerRegistryName string

@description('Location')
param location string

resource acr 'Microsoft.ContainerRegistry/registries@2023-06-01-preview' = {
  name: containerRegistryName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

output loginServer string = acr.properties.loginServer

