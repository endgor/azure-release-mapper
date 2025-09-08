targetScope = 'subscription'

@description('Resource group name')
param resourceGroupName string

@description('Location')
param location string

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
}

output name string = rg.name
output locationOut string = rg.location

