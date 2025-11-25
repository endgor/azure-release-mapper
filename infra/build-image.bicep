targetScope = 'resourceGroup'

@description('Location')
param location string

@description('Container Registry name')
param containerRegistryName string

@description('Container image repository name')
param containerImageName string

@description('Container image tag to build')
param containerImageTag string = 'latest'

@description('ACR build source context URL (e.g., https://github.com/org/repo.git#main)')
param sourceRepoUrl string

resource acr 'Microsoft.ContainerRegistry/registries@2023-06-01-preview' existing = {
  name: containerRegistryName
}

// User-assigned identity for running the deployment script
resource buildIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${containerRegistryName}-build-umi'
  location: location
}

// Grant AcrPush to the identity on the ACR
@description('Role assignment for AcrPush to the build identity')
resource acrPushRA 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acr.id, 'acr-push', buildIdentity.properties.principalId)
  scope: acr
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '8311e382-0749-4cb8-b61a-304f252e45ec') // AcrPush
    principalId: buildIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// Build the image in ACR using the Git repo as context
resource buildScript 'Microsoft.Resources/deploymentScripts@2020-10-01' = {
  name: 'acrBuildImage'
  location: location
  kind: 'AzureCLI'
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${buildIdentity.id}': {}
    }
  }
  properties: {
    azCliVersion: '2.55.0'
    timeout: 'PT60M'
    retentionInterval: 'P1D'
    cleanupPreference: 'OnSuccess'
    environmentVariables: [
      {
        name: 'ACR_NAME'
        value: containerRegistryName
      }
      {
        name: 'IMAGE_NAME'
        value: containerImageName
      }
      {
        name: 'IMAGE_TAG'
        value: containerImageTag
      }
      {
        name: 'SOURCE_URL'
        value: sourceRepoUrl
      }
    ]
    scriptContent: '''
      set -e
      echo "Building $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG from $SOURCE_URL"
      az acr build \
        --registry $ACR_NAME \
        --image $ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG \
        $SOURCE_URL
    '''
  }
  dependsOn: [ acrPushRA ]
}

output builtImage string = '${containerRegistryName}.azurecr.io/${containerImageName}:${containerImageTag}'

