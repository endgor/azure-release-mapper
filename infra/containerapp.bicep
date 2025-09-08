targetScope = 'resourceGroup'

@description('Location')
param location string

@description('Container App name')
param containerAppName string

@description('Container image (including registry)')
param containerImage string

@description('Container Registry server (e.g., myacr.azurecr.io)')
param containerRegistryServer string

@description('Container Registry name (for admin creds binding)')
param containerRegistryName string

// Log Analytics workspace for Container Apps env
resource law 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${containerAppName}-log'
  location: location
  properties: {
    retentionInDays: 30
    features: {
      disableLocalAuth: false
    }
  }
}

// Container Apps managed environment
resource env 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: '${containerAppName}-env'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: law.properties.customerId
        sharedKey: law.listKeys().primarySharedKey
      }
    }
    // Enable v2 workload profile model for Consumption (allows up to 4 vCPU/8Gi per replica when supported)
    workloadProfiles: [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
        minimumCount: 0
        maximumCount: 3
      }
    ]
  }
}

// Get ACR admin credentials
resource acr 'Microsoft.ContainerRegistry/registries@2023-06-01-preview' existing = {
  name: containerRegistryName
}

var acrCreds = acr.listCredentials()

// Container App
resource app 'Microsoft.App/containerApps@2024-03-01' = {
  name: containerAppName
  location: location
  properties: {
    workloadProfileName: 'Consumption'
    managedEnvironmentId: env.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8787
        transport: 'auto'
      }
      registries: [
        {
          server: containerRegistryServer
          username: acrCreds.username
          passwordSecretRef: 'acr-pwd'
        }
      ]
      secrets: [
        {
          name: 'acr-pwd'
          value: acrCreds.passwords[0].value
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'app'
          image: containerImage
          env: [
            {
              name: 'PORT'
              value: '8787'
            }
            {
              name: 'OLLAMA_MODEL'
              value: 'phi3.5:mini'
            }
            {
              name: 'OLLAMA_HOST'
              value: '127.0.0.1'
            }
          ]
          resources: {
            cpu: 4
            memory: '8Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 1
      }
    }
  }
}

output url string = app.properties.configuration.ingress.fqdn
