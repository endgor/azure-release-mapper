
export interface ServiceMapping {
  rssNames: string[]
  weight: number
}

export const AZURE_SERVICE_MAPPINGS: Record<string, ServiceMapping> = {
  // Compute Services
  'microsoft.compute/virtualmachines': {
    rssNames: ['Virtual Machines', 'VM', 'Azure Virtual Machines', 'Compute'],
    weight: 0.9
  },
  'microsoft.compute/virtualmachinescalesets': {
    rssNames: ['Virtual Machine Scale Sets', 'VMSS', 'Scale Sets'],
    weight: 0.9
  },
  'microsoft.compute/availabilitysets': {
    rssNames: ['Availability Sets', 'Virtual Machines', 'Compute'],
    weight: 0.8
  },
  'microsoft.compute/disks': {
    rssNames: ['Managed Disks', 'Azure Managed Disks', 'Azure Disks', 'Azure Disk Storage'],
    weight: 0.8
  },
  'microsoft.batch/batchaccounts': {
    rssNames: ['Azure Batch', 'Batch'],
    weight: 0.9
  },

  // Network Services
  'microsoft.network/virtualnetworks': {
    rssNames: ['Virtual Network', 'VNet', 'Networking'],
    weight: 0.9
  },
  'microsoft.network/publicipaddresses': {
    rssNames: ['Public IP', 'IP Address', 'Networking'],
    weight: 0.8
  },
  'microsoft.network/networkinterfaces': {
    rssNames: ['Network Interface', 'NIC', 'Networking'],
    weight: 0.7
  },
  'microsoft.network/networksecuritygroups': {
    rssNames: ['Network Security Group', 'NSG', 'Security', 'Networking'],
    weight: 0.8
  },
  'microsoft.network/loadbalancers': {
    rssNames: ['Load Balancer', 'Azure Load Balancer'],
    weight: 0.9
  },
  'microsoft.network/applicationgateways': {
    rssNames: ['Application Gateway', 'App Gateway', 'Web Application Firewall', 'Azure WAF'],
    weight: 0.9
  },
  'microsoft.network/expressroutecircuits': {
    rssNames: ['ExpressRoute', 'Express Route'],
    weight: 0.9
  },
  'microsoft.network/vpngateways': {
    rssNames: ['VPN Gateway', 'VPN'],
    weight: 0.9
  },
  'microsoft.network/bastionhosts': {
    rssNames: ['Azure Bastion', 'Bastion'],
    weight: 0.9
  },
  'microsoft.network/frontdoors': {
    rssNames: ['Azure Front Door', 'Front Door', 'Web Application Firewall', 'Azure WAF'],
    weight: 0.9
  },
  'microsoft.network/frontdoorwebapplicationfirewallpolicies': {
    rssNames: ['Web Application Firewall', 'Azure WAF', 'WAF Policy'],
    weight: 0.9
  },
  'microsoft.network/privatednszones': {
    rssNames: ['Private DNS', 'DNS', 'Azure DNS'],
    weight: 0.8
  },
  'microsoft.network/routetables': {
    rssNames: ['Route Table', 'Routing', 'Networking'],
    weight: 0.7
  },

  // Storage Services
  'microsoft.storage/storageaccounts': {
    rssNames: [
      'Storage Account',
      'Storage Accounts',
      'Azure Storage Account',
      'Azure Storage Accounts',
      'Azure Storage'
    ],
    weight: 0.9
  },
  'microsoft.storagesync/storagesyncservices': {
    rssNames: ['Azure File Sync', 'File Sync'],
    weight: 0.8
  },

  // Database Services
  'microsoft.sql/servers': {
    rssNames: ['Azure SQL Database', 'SQL Database', 'Azure SQL', 'Azure SQL Managed Instance', 'Azure Synapse Analytics'],
    weight: 0.9
  },
  'microsoft.sql/servers/databases': {
    rssNames: ['Azure SQL Database', 'SQL Database', 'Azure SQL', 'Azure SQL Managed Instance', 'Azure Synapse Analytics'],
    weight: 0.9
  },
  'microsoft.sqlvirtualmachine/sqlvirtualmachines': {
    rssNames: ['SQL Server on Azure VMs', 'SQL Server', 'Virtual Machines'],
    weight: 0.8
  },
  'microsoft.documentdb/databaseaccounts': {
    rssNames: ['Azure Cosmos DB', 'Cosmos DB'],
    weight: 0.9
  },
  'microsoft.cache/redis': {
    rssNames: ['Azure Cache for Redis', 'Redis'],
    weight: 0.9
  },
  'microsoft.dbformysql/servers': {
    rssNames: ['Azure Database for MySQL', 'MySQL'],
    weight: 0.9
  },
  'microsoft.dbforpostgresql/servers': {
    rssNames: ['Azure Database for PostgreSQL', 'PostgreSQL'],
    weight: 0.9
  },

  // App Services
  'microsoft.web/sites': {
    rssNames: ['Azure App Service', 'App Service Web Apps'],
    weight: 0.9
  },
  'microsoft.web/serverfarms': {
    rssNames: ['App Service Plan', 'App Service'],
    weight: 0.8
  },

  // Container Services
  'microsoft.containerservice/managedclusters': {
    rssNames: ['Azure Kubernetes Service', 'AKS', 'Kubernetes'],
    weight: 0.9
  },
  'microsoft.containerregistry/registries': {
    rssNames: ['Azure Container Registry', 'Container Registry', 'ACR'],
    weight: 0.9
  },
  'microsoft.containerinstance/containergroups': {
    rssNames: ['Azure Container Instances', 'Container Instances', 'ACI'],
    weight: 0.9
  },

  // Data & Analytics
  'microsoft.datafactory/factories': {
    rssNames: ['Azure Data Factory', 'Data Factory', 'ADF'],
    weight: 0.9
  },
  'microsoft.databricks/workspaces': {
    rssNames: ['Azure Databricks', 'Databricks'],
    weight: 0.9
  },
  'microsoft.synapse/workspaces': {
    rssNames: ['Azure Synapse Analytics', 'Synapse'],
    weight: 0.9
  },
  'microsoft.operationalinsights/workspaces': {
    rssNames: ['Log Analytics', 'Azure Monitor', 'Monitor'],
    weight: 0.8
  },

  // AI & Machine Learning
  'microsoft.cognitiveservices/accounts': {
    rssNames: ['Cognitive Services', 'Azure AI', 'AI Services'],
    weight: 0.9
  },
  'microsoft.machinelearningservices/workspaces': {
    rssNames: ['Azure Machine Learning', 'Machine Learning', 'ML'],
    weight: 0.9
  },
  'microsoft.autonomoussystems/workspaces': {
    rssNames: ['Microsoft Autonomous Systems', 'Autonomous Systems'],
    weight: 0.7
  },
  'microsoft.enterpriseknowledgegraph/services': {
    rssNames: ['Enterprise Knowledge Graph', 'Knowledge Graph'],
    weight: 0.7
  },

  // Security & Identity
  'microsoft.keyvault/vaults': {
    rssNames: ['Azure Key Vault', 'Key Vault'],
    weight: 0.9
  },
  'microsoft.aad/domainservices': {
    rssNames: ['Azure Active Directory Domain Services', 'Azure AD DS'],
    weight: 0.9
  },

  // Monitoring & Management
  'microsoft.insights/actiongroups': {
    rssNames: ['Azure Monitor', 'Action Groups', 'Monitor', 'Alerts'],
    weight: 0.8
  },
  'microsoft.insights/metricalerts': {
    rssNames: ['Azure Monitor', 'Metric Alerts', 'Monitor', 'Alerts'],
    weight: 0.8
  },
  'microsoft.insights/activitylogalerts': {
    rssNames: ['Azure Monitor', 'Activity Log Alerts', 'Monitor', 'Alerts'],
    weight: 0.8
  },
  'microsoft.alertsmanagement/alerts': {
    rssNames: ['Azure Monitor', 'Alerts Management', 'Monitor', 'Alert Management'],
    weight: 0.8
  },
  'microsoft.changeanalysis/profile': {
    rssNames: ['Azure Monitor', 'Change Analysis', 'Monitor'],
    weight: 0.8
  },
  'microsoft.monitor/accounts': {
    rssNames: ['Azure Monitor', 'Monitor', 'Monitoring'],
    weight: 0.9
  },
  'microsoft.workloadmonitor/monitors': {
    rssNames: ['Azure Monitor', 'Workload Monitor', 'Monitor'],
    weight: 0.8
  },

  // Messaging Services
  'microsoft.servicebus/namespaces': {
    rssNames: ['Azure Service Bus', 'Service Bus'],
    weight: 0.9
  },
  'microsoft.eventhub/namespaces': {
    rssNames: ['Azure Event Hubs', 'Event Hubs'],
    weight: 0.9
  },

  // IoT Services
  'microsoft.devices/iothubs': {
    rssNames: ['Azure IoT Hub', 'IoT Hub', 'IoT'],
    weight: 0.9
  },

  // Media Services
  'microsoft.media/mediaservices': {
    rssNames: ['Azure Media Services', 'Media Services'],
    weight: 0.9
  },

  // Recovery Services
  'microsoft.recoveryservices/vaults': {
    rssNames: ['Azure Site Recovery', 'Site Recovery', 'Azure Backup', 'Recovery Services'],
    weight: 0.9
  },

  // Analytics & Data Services
  'microsoft.kusto/clusters': {
    rssNames: ['Azure Data Explorer', 'Data Explorer', 'ADX', 'Kusto'],
    weight: 0.9
  },
  'microsoft.hdinsight/clusters': {
    rssNames: ['Azure HDInsight', 'HDInsight', 'Hadoop', 'Spark'],
    weight: 0.8
  },
  'microsoft.streamanalytics/streamingjobs': {
    rssNames: ['Azure Stream Analytics', 'Stream Analytics'],
    weight: 0.9
  },
  'microsoft.powerbidedicated/capacities': {
    rssNames: ['Power BI Embedded', 'Power BI'],
    weight: 0.8
  },
  'microsoft.analysisservices/servers': {
    rssNames: ['Azure Analysis Services', 'Analysis Services'],
    weight: 0.8
  },
  'microsoft.datalakestore/accounts': {
    rssNames: ['Azure Data Lake Storage', 'Data Lake Storage', 'ADLS'],
    weight: 0.8
  },
  'microsoft.datashare/accounts': {
    rssNames: ['Azure Data Share', 'Data Share'],
    weight: 0.8
  },
  'microsoft.purview/accounts': {
    rssNames: ['Microsoft Purview', 'Purview'],
    weight: 0.8
  },

  // Integration Services
  'microsoft.apimanagement/service': {
    rssNames: ['Azure API Management', 'API Management', 'APIM'],
    weight: 0.9
  },
  'microsoft.logic/workflows': {
    rssNames: ['Azure Logic Apps', 'Logic Apps'],
    weight: 0.9
  },
  'microsoft.eventgrid/topics': {
    rssNames: ['Azure Event Grid', 'Event Grid'],
    weight: 0.9
  },
  'microsoft.eventgrid/domains': {
    rssNames: ['Azure Event Grid', 'Event Grid'],
    weight: 0.8
  },
  'microsoft.notificationhubs/namespaces': {
    rssNames: ['Azure Notification Hubs', 'Notification Hubs'],
    weight: 0.8
  },
  'microsoft.relay/namespaces': {
    rssNames: ['Azure Relay', 'Relay'],
    weight: 0.8
  },
  'microsoft.communication/communicationservices': {
    rssNames: ['Azure Communication Services', 'Communication Services'],
    weight: 0.9
  },
  'microsoft.powerplatform/accounts': {
    rssNames: ['Microsoft Power Platform', 'Power Platform'],
    weight: 0.8
  },

  // Security Services
  'microsoft.security/assessments': {
    rssNames: ['Microsoft Defender for Cloud', 'Security Center', 'Defender'],
    weight: 0.9
  },
  'microsoft.securityinsights/workspaces': {
    rssNames: ['Microsoft Sentinel', 'Azure Sentinel', 'Sentinel'],
    weight: 0.9
  },
  'microsoft.attestation/attestationproviders': {
    rssNames: ['Azure Attestation', 'Attestation Service'],
    weight: 0.8
  },
  'microsoft.hardwaresecuritymodules/dedicatedhsms': {
    rssNames: ['Azure Dedicated HSM', 'Dedicated HSM'],
    weight: 0.8
  },
  'microsoft.dataprotection/backupvaults': {
    rssNames: ['Azure Backup', 'Data Protection', 'Backup'],
    weight: 0.8
  },
  'microsoft.customerlockbox/requests': {
    rssNames: ['Customer Lockbox', 'Lockbox'],
    weight: 0.8
  },
  'microsoft.windowsdefenderatp/diagnosticsettings': {
    rssNames: ['Microsoft Defender Advanced Threat Protection', 'Defender ATP'],
    weight: 0.8
  },
  'microsoft.windowsesu/multipleactivationkeys': {
    rssNames: ['Extended Security Updates', 'Windows ESU'],
    weight: 0.7
  },

  // Management & Governance Services
  'microsoft.automation/automationaccounts': {
    rssNames: ['Azure Automation', 'Automation', 'Runbooks'],
    weight: 0.9
  },
  'microsoft.addons/supportproviders': {
    rssNames: ['Azure Support', 'Support Services'],
    weight: 0.7
  },
  'microsoft.azurestack/registrations': {
    rssNames: ['Azure Stack', 'Stack Registration'],
    weight: 0.7
  },
  'microsoft.capacity/resourceproviders': {
    rssNames: ['Azure Capacity', 'Capacity Management'],
    weight: 0.7
  },
  'microsoft.marketplace/offers': {
    rssNames: ['Azure Marketplace', 'Marketplace'],
    weight: 0.8
  },
  'microsoft.marketplaceapps/classicdevservices': {
    rssNames: ['Azure Marketplace', 'Marketplace Apps'],
    weight: 0.7
  },
  'microsoft.marketplaceordering/agreements': {
    rssNames: ['Azure Marketplace', 'Marketplace Ordering'],
    weight: 0.8
  },
  'microsoft.saas/applications': {
    rssNames: ['Azure SaaS', 'SaaS Applications'],
    weight: 0.8
  },
  'microsoft.services/rollouts': {
    rssNames: ['Azure Services', 'Service Rollouts'],
    weight: 0.7
  },
  'microsoft.subscription/subscriptions': {
    rssNames: ['Azure Subscription', 'Subscription Management'],
    weight: 0.8
  },
  'microsoft.support/supporttickets': {
    rssNames: ['Azure Support', 'Support Tickets'],
    weight: 0.8
  },
  'microsoft.advisor/recommendations': {
    rssNames: ['Azure Advisor', 'Advisor'],
    weight: 0.8
  },
  'microsoft.blueprint/blueprints': {
    rssNames: ['Azure Blueprints', 'Blueprints'],
    weight: 0.8
  },
  'microsoft.policyinsights/policyevents': {
    rssNames: ['Azure Policy', 'Policy'],
    weight: 0.8
  },
  'microsoft.managedservices/registrationdefinitions': {
    rssNames: ['Azure Lighthouse', 'Lighthouse', 'Managed Services'],
    weight: 0.8
  },
  'microsoft.resourcehealth/events': {
    rssNames: ['Azure Service Health', 'Service Health', 'Resource Health'],
    weight: 0.8
  },
  'microsoft.resourcegraph/queries': {
    rssNames: ['Azure Resource Graph', 'Resource Graph'],
    weight: 0.8
  },
  'microsoft.billing/billingaccounts': {
    rssNames: ['Azure Billing', 'Cost Management and Billing', 'Billing'],
    weight: 0.8
  },
  'microsoft.consumption/usagedetails': {
    rssNames: ['Azure Cost Management', 'Cost Management', 'Usage Details'],
    weight: 0.8
  },
  'microsoft.costmanagement/exports': {
    rssNames: ['Azure Cost Management', 'Cost Management', 'Cost Management Exports'],
    weight: 0.8
  },
  'microsoft.scheduler/jobcollections': {
    rssNames: ['Azure Scheduler', 'Scheduler'],
    weight: 0.7
  },
  'microsoft.solutions/applications': {
    rssNames: ['Azure Managed Applications', 'Managed Applications'],
    weight: 0.8
  },

  // Container Services
  'microsoft.app/containerapps': {
    rssNames: ['Azure Container Apps', 'Container Apps', 'ACA'],
    weight: 0.9
  },
  'microsoft.app/managedenvironments': {
    rssNames: ['Azure Container Apps', 'Container Apps Environment'],
    weight: 0.8
  },
  'microsoft.redhatopenshift/openshiftclusters': {
    rssNames: ['Azure Red Hat OpenShift', 'OpenShift', 'ARO'],
    weight: 0.8
  },

  // Compute Services
  'microsoft.appplatform/spring': {
    rssNames: ['Azure Spring Apps', 'Spring Apps', 'Spring Cloud'],
    weight: 0.9
  },
  'microsoft.microservices4spring/apps': {
    rssNames: ['Azure Spring Apps', 'Spring Apps', 'Microservices'],
    weight: 0.8
  },
  'microsoft.classiccompute/virtualmachines': {
    rssNames: ['Classic Virtual Machines', 'Classic VM', 'Virtual Machines'],
    weight: 0.7
  },
  'microsoft.avs/privateclouds': {
    rssNames: ['Azure VMware Solution', 'VMware Solution', 'AVS'],
    weight: 0.8
  },
  'microsoft.hanaonauzre/hanainstances': {
    rssNames: ['SAP HANA on Azure Large Instances', 'SAP HANA', 'HANA'],
    weight: 0.8
  },
  'microsoft.desktopvirtualization/hostpools': {
    rssNames: ['Azure Virtual Desktop', 'Virtual Desktop', 'AVD', 'Windows Virtual Desktop'],
    weight: 0.9
  },
  'microsoft.servicefabric/clusters': {
    rssNames: ['Azure Service Fabric', 'Service Fabric'],
    weight: 0.8
  },
  'microsoft.devtestlab/labs': {
    rssNames: ['Azure DevTest Labs', 'DevTest Labs'],
    weight: 0.8
  },
  'microsoft.labservices/labs': {
    rssNames: ['Azure Lab Services', 'Lab Services'],
    weight: 0.8
  },
  'microsoft.maintenance/maintenanceconfigurations': {
    rssNames: ['Azure Maintenance', 'Maintenance Configurations'],
    weight: 0.8
  },
  'microsoft.serialconsole/consoleservices': {
    rssNames: ['Azure Serial Console', 'Serial Console'],
    weight: 0.7
  },
  'microsoft.virtualmachineimages/imagetemplates': {
    rssNames: ['Azure Image Builder', 'VM Image Builder'],
    weight: 0.8
  },
  'microsoft.vmware/privateclouds': {
    rssNames: ['Azure VMware Solution', 'VMware Solution'],
    weight: 0.8
  },
  'microsoft.vmwarecloudsimple/virtualmachines': {
    rssNames: ['Azure VMware Solution by CloudSimple', 'VMware CloudSimple'],
    weight: 0.7
  },
  'microsoft.quantum/workspaces': {
    rssNames: ['Azure Quantum', 'Quantum'],
    weight: 0.7
  },

  // Database Services
  'microsoft.dbformariadb/servers': {
    rssNames: ['Azure Database for MariaDB', 'MariaDB'],
    weight: 0.9
  },
  'microsoft.azuredata/sqlserverregistrations': {
    rssNames: ['SQL Server enabled by Azure Arc', 'Azure Arc SQL'],
    weight: 0.8
  },

  // Healthcare & FHIR Services
  'microsoft.healthcareapis/services': {
    rssNames: ['Azure API for FHIR', 'Healthcare APIs', 'FHIR'],
    weight: 0.9
  },
  'microsoft.healthcareapis/workspaces': {
    rssNames: ['Healthcare APIs', 'FHIR', 'Azure Health Data Services'],
    weight: 0.9
  },

  // Network Services
  'microsoft.cdn/profiles': {
    rssNames: ['Azure Content Delivery Network', 'Azure CDN', 'CDN'],
    weight: 0.9
  },
  'microsoft.classicnetwork/virtualnetworks': {
    rssNames: ['Classic Virtual Network', 'Classic VNet', 'Networking'],
    weight: 0.7
  },
  'microsoft.managednetwork/managednetworks': {
    rssNames: ['Managed Network', 'PaaS Networking'],
    weight: 0.7
  },
  'microsoft.peering/peerings': {
    rssNames: ['Azure Peering Service', 'Peering Service'],
    weight: 0.8
  },
  'microsoft.network/firewall': {
    rssNames: ['Azure Firewall', 'Firewall'],
    weight: 0.9
  },
  'microsoft.network/ddosprotectionplans': {
    rssNames: ['Azure DDoS Protection', 'DDoS Protection'],
    weight: 0.8
  },

  // Storage Services
  'microsoft.netapp/netappaccounts': {
    rssNames: ['Azure NetApp Files', 'NetApp Files', 'ANF'],
    weight: 0.9
  },
  'microsoft.classicstorage/storageaccounts': {
    rssNames: ['Classic Storage', 'Classic Storage Account'],
    weight: 0.7
  },
  'microsoft.storagecache/caches': {
    rssNames: ['Azure HPC Cache', 'HPC Cache'],
    weight: 0.8
  },
  'microsoft.elasticsan/elasticsans': {
    rssNames: ['Azure Elastic SAN', 'Elastic SAN'],
    weight: 0.8
  },
  'microsoft.importexport/jobs': {
    rssNames: ['Azure Import/Export', 'Import Export'],
    weight: 0.8
  },
  'microsoft.storsimple/managers': {
    rssNames: ['Azure StorSimple', 'StorSimple'],
    weight: 0.7
  },
  'microsoft.hybriddata/datamanagers': {
    rssNames: ['Azure StorSimple', 'StorSimple', 'Hybrid Data Manager'],
    weight: 0.7
  },
  'microsoft.objectstore/osnamespaces': {
    rssNames: ['Azure Object Store', 'Object Store'],
    weight: 0.7
  },

  // Web Services
  'microsoft.signalrservice/signalr': {
    rssNames: ['Azure SignalR Service', 'SignalR'],
    weight: 0.9
  },
  'microsoft.maps/accounts': {
    rssNames: ['Azure Maps', 'Maps'],
    weight: 0.8
  },
  'microsoft.bingmaps/mapapis': {
    rssNames: ['Bing Maps', 'Bing Maps API'],
    weight: 0.7
  },
  'microsoft.certificateregistration/certificateorders': {
    rssNames: ['App Service Certificates', 'SSL Certificates'],
    weight: 0.7
  },
  'microsoft.domainregistration/domains': {
    rssNames: ['App Service Domains', 'Custom Domains'],
    weight: 0.7
  },

  // AI & ML Services
  'microsoft.botservice/botservices': {
    rssNames: ['Azure Bot Service', 'Bot Service', 'Bot Framework'],
    weight: 0.9
  },
  'microsoft.search/searchservices': {
    rssNames: ['Azure AI Search', 'Azure Cognitive Search', 'Search Service'],
    weight: 0.9
  },

  // IoT Services
  'microsoft.iotcentral/iotapps': {
    rssNames: ['Azure IoT Central', 'IoT Central'],
    weight: 0.9
  },
  'microsoft.digitaltwins/digitaltwinsinstances': {
    rssNames: ['Azure Digital Twins', 'Digital Twins'],
    weight: 0.9
  },
  'microsoft.timeseriesinsights/environments': {
    rssNames: ['Azure Time Series Insights', 'Time Series Insights'],
    weight: 0.8
  },
  'microsoft.deviceupdate/accounts': {
    rssNames: ['Device Update for IoT Hub', 'Device Update'],
    weight: 0.8
  },
  'microsoft.iotspaces/graph': {
    rssNames: ['Azure Digital Twins', 'IoT Spaces'],
    weight: 0.7
  },
  'microsoft.windowsiot/deviceservices': {
    rssNames: ['Windows 10 IoT Core Services', 'Windows IoT'],
    weight: 0.7
  },

  // Identity Services - Enhanced
  'microsoft.azureactivedirectory/b2cdirectories': {
    rssNames: ['Microsoft Entra ID B2C', 'Azure AD B2C', 'B2C'],
    weight: 0.9
  },
  'microsoft.adhybridhealthservice/services': {
    rssNames: ['Microsoft Entra ID', 'Azure Active Directory', 'AAD Health Service'],
    weight: 0.8
  },
  'microsoft.managedidentity/userassignedidentities': {
    rssNames: ['Managed Identity', 'User Assigned Identity'],
    weight: 0.8
  },
  'microsoft.token/stores': {
    rssNames: ['Token Service', 'Tokens'],
    weight: 0.7
  },

  // Developer Tools
  'microsoft.appconfiguration/configurationstores': {
    rssNames: ['Azure App Configuration', 'App Configuration'],
    weight: 0.9
  },
  'microsoft.devcenter/devcenters': {
    rssNames: ['Microsoft Dev Box', 'Dev Box'],
    weight: 0.8
  },
  'microsoft.devspaces/controllers': {
    rssNames: ['Azure Dev Spaces', 'Dev Spaces'],
    weight: 0.7
  },
  'microsoft.loadtestservice/loadtests': {
    rssNames: ['Azure Load Testing', 'Load Testing'],
    weight: 0.9
  },
  'microsoft.notebooks/notebookproxies': {
    rssNames: ['Azure Notebooks', 'Notebooks'],
    weight: 0.7
  },

  // DevOps Services
  'microsoft.visualstudio/account': {
    rssNames: ['Azure DevOps', 'DevOps', 'Visual Studio Team Services'],
    weight: 0.9
  },
  'microsoft.vsonline/accounts': {
    rssNames: ['Azure DevOps', 'DevOps'],
    weight: 0.8
  },
  'microsoft.devopsinfrastructure/pools': {
    rssNames: ['Managed DevOps Pools', 'DevOps Pools'],
    weight: 0.8
  },

  // Migration Services
  'microsoft.migrate/projects': {
    rssNames: ['Azure Migrate', 'Migrate'],
    weight: 0.9
  },
  'microsoft.databox/jobs': {
    rssNames: ['Azure Data Box', 'Data Box'],
    weight: 0.8
  },
  'microsoft.datamigration/services': {
    rssNames: ['Azure Database Migration Service', 'Database Migration'],
    weight: 0.9
  },
  'microsoft.databoxedge/databoxedgedevices': {
    rssNames: ['Azure Stack Edge', 'Azure Data Box Edge', 'Stack Edge'],
    weight: 0.8
  },
  'microsoft.offazure/serversites': {
    rssNames: ['Azure Migrate', 'Migrate Assessment'],
    weight: 0.8
  },
  'microsoft.classicinfrastructuremigrate/classicinfrastructureresources': {
    rssNames: ['Classic Infrastructure Migration', 'Azure Migration'],
    weight: 0.7
  },

  // Hybrid & Multi-cloud Services
  'microsoft.hybridcompute/machines': {
    rssNames: ['Azure Arc-enabled servers', 'Azure Arc servers', 'Arc servers'],
    weight: 0.9
  },
  'microsoft.kubernetes/connectedclusters': {
    rssNames: ['Azure Arc-enabled Kubernetes', 'Arc-enabled Kubernetes'],
    weight: 0.9
  },
  'microsoft.kubernetesconfiguration/extensions': {
    rssNames: ['Azure Arc-enabled Kubernetes', 'Kubernetes Configuration'],
    weight: 0.8
  },
  'microsoft.azurearcdata/datacontrollers': {
    rssNames: ['Azure Arc-enabled data services', 'Arc data services'],
    weight: 0.8
  },
  'microsoft.azurestackhci/clusters': {
    rssNames: ['Azure Stack HCI', 'Azure Local', 'Stack HCI'],
    weight: 0.8
  },
  'microsoft.edge/sites': {
    rssNames: ['Azure Arc site manager', 'Arc Site Manager'],
    weight: 0.8
  },

  // Blockchain & Emerging Technologies
  'microsoft.blockchain/blockchainmembers': {
    rssNames: ['Azure Blockchain Service', 'Blockchain'],
    weight: 0.7
  },
  'microsoft.blockchaintokens/tokenservices': {
    rssNames: ['Azure Blockchain Tokens', 'Blockchain Tokens'],
    weight: 0.7
  },

  // 5G & Edge Computing
  'microsoft.mobilenetwork/mobilenetworks': {
    rssNames: ['Azure Private 5G Core', 'Private 5G Core'],
    weight: 0.8
  },
  'microsoft.hybridnetwork/networkfunctions': {
    rssNames: ['Azure Network Function Manager', 'Network Function Manager'],
    weight: 0.8
  },

  // Management & Governance
  'microsoft.authorization/policies': {
    rssNames: ['Azure Resource Manager', 'Resource Manager', 'ARM'],
    weight: 0.8
  },
  'microsoft.features/features': {
    rssNames: ['Azure Resource Manager', 'Feature Management'],
    weight: 0.7
  },
  'microsoft.resources/deployments': {
    rssNames: ['Azure Resource Manager', 'Resource Manager', 'ARM'],
    weight: 0.8
  },
  'microsoft.resources/resourcegroups': {
    rssNames: ['Azure Resource Manager', 'Resource Groups'],
    weight: 0.8
  },
  'microsoft.portal/dashboards': {
    rssNames: ['Azure Portal', 'Portal'],
    weight: 0.7
  },
  'microsoft.classicsubscription/operations': {
    rssNames: ['Classic Subscription', 'Azure Subscription'],
    weight: 0.6
  },
  'microsoft.costmanagementexports/exports': {
    rssNames: ['Azure Cost Management', 'Cost Management Exports'],
    weight: 0.8
  },
  'microsoft.customproviders/resourceproviders': {
    rssNames: ['Azure Custom Providers', 'Custom Providers'],
    weight: 0.7
  },
  'microsoft.dynamicslcs/lcsprojects': {
    rssNames: ['Dynamics Lifecycle Services', 'LCS'],
    weight: 0.7
  },
  'microsoft.guestconfiguration/guestconfigurationassignments': {
    rssNames: ['Azure Policy', 'Guest Configuration'],
    weight: 0.8
  },
  'microsoft.management/managementgroups': {
    rssNames: ['Azure Management Groups', 'Management Groups'],
    weight: 0.8
  },
  'microsoft.softwareplan/hybridusebenefits': {
    rssNames: ['Software Plan', 'License Management'],
    weight: 0.7
  },

  // Media Services
  'microsoft.media/transforms': {
    rssNames: ['Azure Media Services', 'Media Services', 'Video Processing'],
    weight: 0.8
  },
  'microsoft.media/liveevents': {
    rssNames: ['Azure Media Services', 'Media Services', 'Live Streaming'],
    weight: 0.8
  },
  'microsoft.media/streamingendpoints': {
    rssNames: ['Azure Media Services', 'Media Services', 'Streaming'],
    weight: 0.8
  },

  // Core Services
  'microsoft.commerce/usageaggregates': {
    rssNames: ['Azure Commerce', 'Usage Aggregates', 'Billing'],
    weight: 0.7
  },
  'microsoft.capacity/reservationorders': {
    rssNames: ['Azure Capacity', 'Reserved Instances', 'Reservations'],
    weight: 0.7
  },

  // Network Services
  'microsoft.network/trafficmanagerprofiles': {
    rssNames: ['Azure Traffic Manager', 'Traffic Manager'],
    weight: 0.9
  },
  'microsoft.network/networkwatchers': {
    rssNames: ['Azure Network Watcher', 'Network Watcher'],
    weight: 0.8
  },
  'microsoft.network/connections': {
    rssNames: ['VPN Gateway', 'ExpressRoute', 'Network Connection'],
    weight: 0.8
  },
  'microsoft.network/localnetworkgateways': {
    rssNames: ['Local Network Gateway', 'VPN Gateway'],
    weight: 0.8
  },
  'microsoft.network/natgateways': {
    rssNames: ['Virtual Network NAT', 'NAT Gateway'],
    weight: 0.8
  },
  'microsoft.network/virtualnetworkgateways': {
    rssNames: ['Virtual Network Gateway', 'VPN Gateway', 'ExpressRoute Gateway'],
    weight: 0.9
  },
  'microsoft.network/privateendpoints': {
    rssNames: ['Azure Private Link', 'Private Endpoints'],
    weight: 0.8
  },
  'microsoft.network/privatelinkservices': {
    rssNames: ['Azure Private Link', 'Private Link Services'],
    weight: 0.8
  },
  'microsoft.network/virtualwans': {
    rssNames: ['Azure Virtual WAN', 'Virtual WAN'],
    weight: 0.9
  },
  'microsoft.network/virtualhubs': {
    rssNames: ['Azure Virtual WAN', 'Virtual Hub'],
    weight: 0.8
  },
  'microsoft.network/p2svpngateways': {
    rssNames: ['Azure Virtual WAN', 'Point-to-Site VPN'],
    weight: 0.8
  },
  'microsoft.network/vpnsites': {
    rssNames: ['Azure Virtual WAN', 'VPN Sites'],
    weight: 0.8
  },
  'microsoft.network/azurefirewalls': {
    rssNames: ['Azure Firewall', 'Firewall'],
    weight: 0.9
  },
  'microsoft.network/firewallpolicies': {
    rssNames: ['Azure Firewall', 'Firewall Policy'],
    weight: 0.8
  },

  // Mixed Reality Services
  'microsoft.mixedreality/spatialanchorsaccounts': {
    rssNames: ['Azure Spatial Anchors', 'Mixed Reality'],
    weight: 0.7
  },
  'microsoft.mixedreality/remoterendering': {
    rssNames: ['Azure Remote Rendering', 'Mixed Reality'],
    weight: 0.7
  },

  // Resource Providers for Categories
  'microsoft.intune/diagnosticsettings': {
    rssNames: ['Microsoft Intune', 'Device Management'],
    weight: 0.8
  },
  'microsoft.operationsmanagement/solutions': {
    rssNames: ['Azure Monitor', 'Operations Management'],
    weight: 0.8
  },

  // Web & App Services
  'microsoft.web/staticsites': {
    rssNames: ['Azure Static Web Apps', 'Static Web Apps'],
    weight: 0.9
  },
  'microsoft.web/hostingenvironments': {
    rssNames: ['App Service Environment', 'ASE'],
    weight: 0.8
  },
  'microsoft.web/certificates': {
    rssNames: ['App Service Certificates', 'SSL Certificates'],
    weight: 0.7
  },

  // Azure Functions
  'microsoft.web/sites/functions': {
    rssNames: ['Azure Functions', 'Function App'],
    weight: 0.9
  },
  'microsoft.web/sites/slots': {
    rssNames: ['App Service Slots', 'Deployment Slots'],
    weight: 0.8
  },

  // Event Grid
  'microsoft.eventgrid/systemtopics': {
    rssNames: ['Azure Event Grid', 'Event Grid System Topics'],
    weight: 0.8
  },
  'microsoft.eventgrid/eventsubscriptions': {
    rssNames: ['Azure Event Grid', 'Event Subscriptions'],
    weight: 0.8
  },
  'microsoft.eventgrid/partnertopics': {
    rssNames: ['Azure Event Grid', 'Partner Topics'],
    weight: 0.8
  },
  'microsoft.eventgrid/partnernamespaces': {
    rssNames: ['Azure Event Grid', 'Partner Namespaces'],
    weight: 0.8
  },

  // Service Bus
  'microsoft.servicebus/namespaces/queues': {
    rssNames: ['Azure Service Bus', 'Service Bus Queues'],
    weight: 0.8
  },
  'microsoft.servicebus/namespaces/topics': {
    rssNames: ['Azure Service Bus', 'Service Bus Topics'],
    weight: 0.8
  },

  // Event Hubs
  'microsoft.eventhub/namespaces/eventhubs': {
    rssNames: ['Azure Event Hubs', 'Event Hubs'],
    weight: 0.8
  },
  'microsoft.eventhub/clusters': {
    rssNames: ['Azure Event Hubs', 'Event Hubs Clusters'],
    weight: 0.8
  },

  // Batch
  'microsoft.batch/batchaccounts/pools': {
    rssNames: ['Azure Batch', 'Batch Pools'],
    weight: 0.8
  },
  'microsoft.batch/batchaccounts/jobs': {
    rssNames: ['Azure Batch', 'Batch Jobs'],
    weight: 0.8
  },

  // Cognitive Services
  'microsoft.cognitiveservices/accounts/deployments': {
    rssNames: ['Azure OpenAI Service', 'OpenAI', 'Cognitive Services'],
    weight: 0.9
  },

  // Storage (Additional Types)
  'microsoft.storage/storageaccounts/blobservices': {
    rssNames: ['Azure Blob Storage', 'Blob Storage'],
    weight: 0.8
  },
  'microsoft.storage/storageaccounts/fileservices': {
    rssNames: ['Azure Files', 'File Storage'],
    weight: 0.8
  },
  'microsoft.storage/storageaccounts/queueservices': {
    rssNames: ['Azure Queue Storage', 'Queue Storage'],
    weight: 0.8
  },
  'microsoft.storage/storageaccounts/tableservices': {
    rssNames: ['Azure Table Storage', 'Table Storage'],
    weight: 0.8
  },

  // SQL (Additional Types)
  'microsoft.sql/servers/elasticpools': {
    rssNames: ['Azure SQL Database', 'SQL Elastic Pool', 'Elastic Pool'],
    weight: 0.8
  },
  'microsoft.sql/managedinstances': {
    rssNames: ['Azure SQL Managed Instance', 'SQL Managed Instance'],
    weight: 0.9
  },
  'microsoft.sql/servers/firewallrules': {
    rssNames: ['Azure SQL Database', 'SQL Firewall Rules'],
    weight: 0.7
  },

  // Virtual Machines (Additional Types)
  'microsoft.compute/snapshots': {
    rssNames: ['Azure Snapshots', 'VM Snapshots', 'Disk Snapshots'],
    weight: 0.8
  },
  'microsoft.compute/images': {
    rssNames: ['VM Images', 'Azure Images', 'Virtual Machine Images'],
    weight: 0.8
  },
  'microsoft.compute/galleries': {
    rssNames: ['Azure Compute Gallery', 'Shared Image Gallery'],
    weight: 0.8
  },
  'microsoft.compute/restorepointcollections': {
    rssNames: ['VM Restore Points', 'Virtual Machine Restore Points'],
    weight: 0.7
  },

  // Key Vault
  'microsoft.keyvault/vaults/secrets': {
    rssNames: ['Azure Key Vault', 'Key Vault Secrets'],
    weight: 0.8
  },
  'microsoft.keyvault/vaults/keys': {
    rssNames: ['Azure Key Vault', 'Key Vault Keys'],
    weight: 0.8
  },
  'microsoft.keyvault/vaults/certificates': {
    rssNames: ['Azure Key Vault', 'Key Vault Certificates'],
    weight: 0.8
  },
  'microsoft.keyvault/managedhsms': {
    rssNames: ['Azure Key Vault', 'Managed HSM'],
    weight: 0.8
  },

  // Additional Monitoring & Diagnostics
  'microsoft.insights/diagnosticsettings': {
    rssNames: ['Azure Monitor', 'Diagnostic Settings', 'Monitor'],
    weight: 0.8
  },
  'microsoft.insights/logprofiles': {
    rssNames: ['Azure Monitor', 'Activity Log', 'Monitor'],
    weight: 0.7
  },
  'microsoft.insights/webtests': {
    rssNames: ['Application Insights', 'Web Tests', 'Monitor'],
    weight: 0.8
  },
  'microsoft.insights/components': {
    rssNames: ['Application Insights', 'App Insights', 'Monitor'],
    weight: 0.9
  },
  'microsoft.insights/workbooks': {
    rssNames: ['Azure Monitor', 'Workbooks', 'Monitor'],
    weight: 0.8
  },
  'microsoft.insights/datacollectionrules': {
    rssNames: ['Azure Monitor', 'Data Collection Rules', 'Monitor'],
    weight: 0.8
  },

  // Data & Analytics - ADDITIONAL COVERAGE
  'microsoft.datafactory/factories/pipelines': {
    rssNames: ['Azure Data Factory', 'Data Factory Pipelines', 'ADF'],
    weight: 0.8
  },
  'microsoft.datafactory/factories/datasets': {
    rssNames: ['Azure Data Factory', 'Data Factory Datasets', 'ADF'],
    weight: 0.8
  },
  'microsoft.datafactory/factories/linkedservices': {
    rssNames: ['Azure Data Factory', 'Data Factory Linked Services', 'ADF'],
    weight: 0.8
  },
  'microsoft.synapse/workspaces/sqlpools': {
    rssNames: ['Azure Synapse Analytics', 'SQL Pools', 'Synapse'],
    weight: 0.8
  },
  'microsoft.synapse/workspaces/bigdatapools': {
    rssNames: ['Azure Synapse Analytics', 'Apache Spark Pools', 'Synapse'],
    weight: 0.8
  },

  // Recovery Services
  'microsoft.recoveryservices/vaults/backupjobs': {
    rssNames: ['Azure Backup', 'Backup Jobs', 'Recovery Services'],
    weight: 0.8
  },
  'microsoft.recoveryservices/vaults/backuppolicies': {
    rssNames: ['Azure Backup', 'Backup Policies', 'Recovery Services'],
    weight: 0.8
  },
  'microsoft.recoveryservices/vaults/replicationfabrics': {
    rssNames: ['Azure Site Recovery', 'Site Recovery', 'Recovery Services'],
    weight: 0.8
  },

  // Logic Apps
  'microsoft.logic/workflows/triggers': {
    rssNames: ['Azure Logic Apps', 'Logic App Triggers'],
    weight: 0.8
  },
  'microsoft.logic/workflows/actions': {
    rssNames: ['Azure Logic Apps', 'Logic App Actions'],
    weight: 0.8
  },
  'microsoft.logic/integrationaccounts': {
    rssNames: ['Azure Logic Apps', 'Integration Accounts'],
    weight: 0.8
  },

  // API Management
  'microsoft.apimanagement/service/apis': {
    rssNames: ['Azure API Management', 'API Management APIs', 'APIM'],
    weight: 0.8
  },
  'microsoft.apimanagement/service/products': {
    rssNames: ['Azure API Management', 'API Management Products', 'APIM'],
    weight: 0.8
  },
  'microsoft.apimanagement/service/policies': {
    rssNames: ['Azure API Management', 'API Management Policies', 'APIM'],
    weight: 0.8
  },

  // DevTest Labs
  'microsoft.devtestlab/labs/virtualmachines': {
    rssNames: ['Azure DevTest Labs', 'DevTest Lab VMs'],
    weight: 0.8
  },
  'microsoft.devtestlab/labs/formulas': {
    rssNames: ['Azure DevTest Labs', 'DevTest Lab Formulas'],
    weight: 0.7
  },

  // Cosmos DB
  'microsoft.documentdb/databaseaccounts/sqldatabases': {
    rssNames: ['Azure Cosmos DB', 'Cosmos DB SQL Database'],
    weight: 0.8
  },
  'microsoft.documentdb/databaseaccounts/mongodbdatabases': {
    rssNames: ['Azure Cosmos DB', 'Cosmos DB for MongoDB'],
    weight: 0.8
  },
  'microsoft.documentdb/databaseaccounts/cassandrakeyspaces': {
    rssNames: ['Azure Cosmos DB', 'Cosmos DB Cassandra'],
    weight: 0.8
  },
  'microsoft.documentdb/databaseaccounts/gremlingraphs': {
    rssNames: ['Azure Cosmos DB', 'Cosmos DB Gremlin'],
    weight: 0.8
  },
  'microsoft.documentdb/databaseaccounts/tables': {
    rssNames: ['Azure Cosmos DB', 'Cosmos DB Table'],
    weight: 0.8
  },

  // Search
  'microsoft.search/searchservices/indexes': {
    rssNames: ['Azure AI Search', 'Search Indexes', 'Cognitive Search'],
    weight: 0.8
  },
  'microsoft.search/searchservices/indexers': {
    rssNames: ['Azure AI Search', 'Search Indexers', 'Cognitive Search'],
    weight: 0.8
  },
  'microsoft.search/searchservices/datasources': {
    rssNames: ['Azure AI Search', 'Search Data Sources', 'Cognitive Search'],
    weight: 0.8
  },

  // Additional Azure Arc Services
  'microsoft.hybridcompute/machines/extensions': {
    rssNames: ['Azure Arc-enabled servers', 'Arc Server Extensions'],
    weight: 0.8
  },
  'microsoft.kubernetes/connectedclusters/agents': {
    rssNames: ['Azure Arc-enabled Kubernetes', 'Arc K8s Agents'],
    weight: 0.8
  },

  // Additional Resource Providers
  'microsoft.datacatalog/catalogs': {
    rssNames: ['Azure Data Catalog', 'Data Catalog'],
    weight: 0.8
  },
  'microsoft.datalakeanalytics/accounts': {
    rssNames: ['Azure Data Lake Analytics', 'Data Lake Analytics'],
    weight: 0.8
  },
  'microsoft.projectbabylon/accounts': {
    rssNames: ['Azure Data Catalog', 'Project Babylon'],
    weight: 0.7
  },
  'microsoft.powerbi/workspacecollections': {
    rssNames: ['Power BI', 'Power BI Workspace Collections'],
    weight: 0.8
  },
  'microsoft.edgemarketplace/offers': {
    rssNames: ['Edge Marketplace', 'Marketplace'],
    weight: 0.7
  },
  'microsoft.help/diagnostics': {
    rssNames: ['Azure Help', 'Support'],
    weight: 0.7
  },
  'microsoft.hybridconnectivity/endpoints': {
    rssNames: ['Azure Hybrid Connectivity', 'Hybrid Connectivity'],
    weight: 0.7
  },
  'microsoft.hybridcontainerservice/provisionedclusters': {
    rssNames: ['Azure Kubernetes Service', 'Hybrid Container Service'],
    weight: 0.8
  },

  // Common operational resource types that may appear in feeds
  'microsoft.operationalinsights/workspaces/tables': {
    rssNames: ['Log Analytics', 'Log Analytics Tables', 'Azure Monitor'],
    weight: 0.8
  },
  'microsoft.operationalinsights/workspaces/datasources': {
    rssNames: ['Log Analytics', 'Log Analytics Data Sources', 'Azure Monitor'],
    weight: 0.8
  },

  // Additional common sub-resource types
  'microsoft.network/networkprofiles': {
    rssNames: ['Network Profiles', 'Container Networking'],
    weight: 0.7
  },
  'microsoft.network/serviceendpointpolicies': {
    rssNames: ['Service Endpoint Policies', 'Virtual Network Service Endpoints'],
    weight: 0.7
  },
  'microsoft.network/virtualnetworktaps': {
    rssNames: ['Virtual Network TAP', 'Network TAP'],
    weight: 0.7
  },
  'microsoft.network/networksecurityperimeters': {
    rssNames: ['Network Security Perimeters', 'Security Perimeters'],
    weight: 0.7
  },

  // Resource Manager and Core Operations
  'microsoft.resources/templatespecs': {
    rssNames: ['Azure Resource Manager', 'Template Specs', 'ARM Templates'],
    weight: 0.8
  },
  'microsoft.resources/deploymentscripts': {
    rssNames: ['Azure Resource Manager', 'Deployment Scripts', 'ARM Scripts'],
    weight: 0.8
  }
}

// Cloud type definitions used by region metadata
export enum CloudType {
  COMMERCIAL = 'commercial',
  GOVERNMENT = 'government',
  CHINA = 'china',
  GERMANY = 'germany'
}

export interface RegionMapping {
  aliases: string[]
  cloudType: CloudType
  pairedRegion?: string
  displayName: string
  physicalLocation: string
  geography: string
}

export const REGION_MAPPINGS: Record<string, RegionMapping> = {
  // === AZURE COMMERCIAL CLOUD ===

  // United States - Commercial
  'eastus': {
    aliases: ['East US', 'eastus', 'East US 1', 'virginia', 'eus'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'westus',
    displayName: 'East US',
    physicalLocation: 'Virginia',
    geography: 'United States'
  },
  'eastus2': {
    aliases: ['East US 2', 'eastus2', 'eus2', 'virginia2'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'centralus',
    displayName: 'East US 2',
    physicalLocation: 'Virginia',
    geography: 'United States'
  },
  'westus': {
    aliases: ['West US', 'westus', 'West US 1', 'california', 'wus'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'eastus',
    displayName: 'West US',
    physicalLocation: 'California',
    geography: 'United States'
  },
  'westus2': {
    aliases: ['West US 2', 'westus2', 'wus2', 'washington'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'westcentralus',
    displayName: 'West US 2',
    physicalLocation: 'Washington',
    geography: 'United States'
  },
  'westus3': {
    aliases: ['West US 3', 'westus3', 'wus3', 'phoenix'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'eastus',
    displayName: 'West US 3',
    physicalLocation: 'Phoenix',
    geography: 'United States'
  },
  'centralus': {
    aliases: ['Central US', 'centralus', 'cus', 'iowa'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'eastus2',
    displayName: 'Central US',
    physicalLocation: 'Iowa',
    geography: 'United States'
  },
  'northcentralus': {
    aliases: ['North Central US', 'northcentralus', 'ncus', 'illinois'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'southcentralus',
    displayName: 'North Central US',
    physicalLocation: 'Illinois',
    geography: 'United States'
  },
  'southcentralus': {
    aliases: ['South Central US', 'southcentralus', 'scus', 'texas'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'northcentralus',
    displayName: 'South Central US',
    physicalLocation: 'Texas',
    geography: 'United States'
  },
  'westcentralus': {
    aliases: ['West Central US', 'westcentralus', 'wcus', 'wyoming'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'westus2',
    displayName: 'West Central US',
    physicalLocation: 'Wyoming',
    geography: 'United States'
  },

  // Canada - Commercial
  'canadacentral': {
    aliases: ['Canada Central', 'canadacentral', 'toronto', 'canada central'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'canadaeast',
    displayName: 'Canada Central',
    physicalLocation: 'Toronto',
    geography: 'Canada'
  },
  'canadaeast': {
    aliases: ['Canada East', 'canadaeast', 'quebec', 'canada east'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'canadacentral',
    displayName: 'Canada East',
    physicalLocation: 'Quebec',
    geography: 'Canada'
  },

  // Mexico - Commercial
  'mexicocentral': {
    aliases: ['Mexico Central', 'mexicocentral', 'queretaro', 'mexico central'],
    cloudType: CloudType.COMMERCIAL,
    displayName: 'Mexico Central',
    physicalLocation: 'Querétaro State',
    geography: 'Mexico'
  },

  // Brazil - Commercial
  'brazilsouth': {
    aliases: ['Brazil South', 'brazilsouth', 'sao paulo', 'brazil south'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'southcentralus',
    displayName: 'Brazil South',
    physicalLocation: 'Sao Paulo State',
    geography: 'Brazil'
  },
  'brazilsoutheast': {
    aliases: ['Brazil Southeast', 'brazilsoutheast', 'rio', 'brazil southeast'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'brazilsouth',
    displayName: 'Brazil Southeast',
    physicalLocation: 'Rio',
    geography: 'Brazil'
  },

  // Chile - Commercial
  'chilecentral': {
    aliases: ['Chile Central', 'chilecentral', 'santiago', 'chile central'],
    cloudType: CloudType.COMMERCIAL,
    displayName: 'Chile Central',
    physicalLocation: 'Santiago',
    geography: 'Chile'
  },

  // Europe - Commercial
  'northeurope': {
    aliases: ['North Europe', 'northeurope', 'ne', 'neu', 'ireland', 'dublin'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'westeurope',
    displayName: 'North Europe',
    physicalLocation: 'Ireland',
    geography: 'Europe'
  },
  'westeurope': {
    aliases: ['West Europe', 'westeurope', 'weu', 'western europe', 'netherlands', 'amsterdam'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'northeurope',
    displayName: 'West Europe',
    physicalLocation: 'Netherlands',
    geography: 'Europe'
  },

  // UK - Commercial
  'uksouth': {
    aliases: ['UK South', 'uksouth', 'united kingdom south', 'london', 'uk south'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'ukwest',
    displayName: 'UK South',
    physicalLocation: 'London',
    geography: 'United Kingdom'
  },
  'ukwest': {
    aliases: ['UK West', 'ukwest', 'united kingdom west', 'cardiff', 'uk west'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'uksouth',
    displayName: 'UK West',
    physicalLocation: 'Cardiff',
    geography: 'United Kingdom'
  },

  // France - Commercial
  'francecentral': {
    aliases: ['France Central', 'francecentral', 'paris', 'france central'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'francesouth',
    displayName: 'France Central',
    physicalLocation: 'Paris',
    geography: 'France'
  },
  'francesouth': {
    aliases: ['France South', 'francesouth', 'marseille', 'france south'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'francecentral',
    displayName: 'France South',
    physicalLocation: 'Marseille',
    geography: 'France'
  },

  // Germany - Commercial (Current)
  'germanynorth': {
    aliases: ['Germany North', 'germanynorth', 'berlin', 'germany north'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'germanywestcentral',
    displayName: 'Germany North',
    physicalLocation: 'Berlin',
    geography: 'Germany'
  },
  'germanywestcentral': {
    aliases: ['Germany West Central', 'germanywestcentral', 'frankfurt', 'germany west central'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'germanynorth',
    displayName: 'Germany West Central',
    physicalLocation: 'Frankfurt',
    geography: 'Germany'
  },

  // Switzerland - Commercial
  'switzerlandnorth': {
    aliases: ['Switzerland North', 'switzerlandnorth', 'zurich', 'switzerland north'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'switzerlandwest',
    displayName: 'Switzerland North',
    physicalLocation: 'Zurich',
    geography: 'Switzerland'
  },
  'switzerlandwest': {
    aliases: ['Switzerland West', 'switzerlandwest', 'geneva', 'switzerland west'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'switzerlandnorth',
    displayName: 'Switzerland West',
    physicalLocation: 'Geneva',
    geography: 'Switzerland'
  },

  // Austria - Commercial
  'austriaeast': {
    aliases: ['Austria East', 'austriaeast', 'vienna', 'austria east'],
    cloudType: CloudType.COMMERCIAL,
    displayName: 'Austria East',
    physicalLocation: 'Vienna',
    geography: 'Austria'
  },

  // Belgium - Commercial
  'belgiumcentral': {
    aliases: ['Belgium Central', 'belgiumcentral', 'brussels', 'belgium central'],
    cloudType: CloudType.COMMERCIAL,
    displayName: 'Belgium Central',
    physicalLocation: 'Brussels',
    geography: 'Belgium'
  },

  // Norway - Commercial
  'norwayeast': {
    aliases: ['Norway East', 'norwayeast', 'oslo', 'norway east'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'norwaywest',
    displayName: 'Norway East',
    physicalLocation: 'Norway',
    geography: 'Norway'
  },
  'norwaywest': {
    aliases: ['Norway West', 'norwaywest', 'norway west'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'norwayeast',
    displayName: 'Norway West',
    physicalLocation: 'Norway',
    geography: 'Norway'
  },

  // Sweden - Commercial
  'swedencentral': {
    aliases: ['Sweden Central', 'swedencentral', 'sdc', 'se', 'gavle', 'gävle'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'swedensouth',
    displayName: 'Sweden Central',
    physicalLocation: 'Gävle',
    geography: 'Sweden'
  },
  'swedensouth': {
    aliases: ['Sweden South', 'swedensouth', 'sweden south'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'swedencentral',
    displayName: 'Sweden South',
    physicalLocation: 'Sweden',
    geography: 'Sweden'
  },

  // Poland - Commercial
  'polandcentral': {
    aliases: ['Poland Central', 'polandcentral', 'warsaw', 'poland central'],
    cloudType: CloudType.COMMERCIAL,
    displayName: 'Poland Central',
    physicalLocation: 'Warsaw',
    geography: 'Poland'
  },

  // Italy - Commercial
  'italynorth': {
    aliases: ['Italy North', 'italynorth', 'milan', 'italy north'],
    cloudType: CloudType.COMMERCIAL,
    displayName: 'Italy North',
    physicalLocation: 'Milan',
    geography: 'Italy'
  },

  // Spain - Commercial
  'spaincentral': {
    aliases: ['Spain Central', 'spaincentral', 'madrid', 'spain central'],
    cloudType: CloudType.COMMERCIAL,
    displayName: 'Spain Central',
    physicalLocation: 'Madrid',
    geography: 'Spain'
  },

  // Asia Pacific - Commercial
  'eastasia': {
    aliases: ['East Asia', 'eastasia', 'hong kong', 'hong kong sar', 'hk'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'southeastasia',
    displayName: 'East Asia',
    physicalLocation: 'Hong Kong SAR',
    geography: 'Asia Pacific'
  },
  'southeastasia': {
    aliases: ['Southeast Asia', 'southeastasia', 'sea', 'singapore', 'sg'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'eastasia',
    displayName: 'Southeast Asia',
    physicalLocation: 'Singapore',
    geography: 'Asia Pacific'
  },

  // Japan - Commercial
  'japaneast': {
    aliases: ['Japan East', 'japaneast', 'tokyo', 'saitama', 'japan east'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'japanwest',
    displayName: 'Japan East',
    physicalLocation: 'Tokyo, Saitama',
    geography: 'Japan'
  },
  'japanwest': {
    aliases: ['Japan West', 'japanwest', 'osaka', 'japan west'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'japaneast',
    displayName: 'Japan West',
    physicalLocation: 'Osaka',
    geography: 'Japan'
  },

  // Korea - Commercial
  'koreacentral': {
    aliases: ['Korea Central', 'koreacentral', 'seoul', 'korea central'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'koreasouth',
    displayName: 'Korea Central',
    physicalLocation: 'Seoul',
    geography: 'Korea'
  },
  'koreasouth': {
    aliases: ['Korea South', 'koreasouth', 'busan', 'korea south'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'koreacentral',
    displayName: 'Korea South',
    physicalLocation: 'Busan',
    geography: 'Korea'
  },

  // Australia - Commercial
  'australiaeast': {
    aliases: ['Australia East', 'australiaeast', 'new south wales', 'sydney', 'australia east'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'australiasoutheast',
    displayName: 'Australia East',
    physicalLocation: 'New South Wales',
    geography: 'Australia'
  },
  'australiasoutheast': {
    aliases: ['Australia Southeast', 'australiasoutheast', 'victoria', 'melbourne', 'australia southeast'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'australiaeast',
    displayName: 'Australia Southeast',
    physicalLocation: 'Victoria',
    geography: 'Australia'
  },
  'australiacentral': {
    aliases: ['Australia Central', 'australiacentral', 'canberra', 'australia central'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'australiacentral2',
    displayName: 'Australia Central',
    physicalLocation: 'Canberra',
    geography: 'Australia'
  },
  'australiacentral2': {
    aliases: ['Australia Central 2', 'australiacentral2', 'canberra2', 'australia central 2'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'australiacentral',
    displayName: 'Australia Central 2',
    physicalLocation: 'Canberra',
    geography: 'Australia'
  },

  // New Zealand - Commercial
  'newzealandnorth': {
    aliases: ['New Zealand North', 'newzealandnorth', 'auckland', 'new zealand north'],
    cloudType: CloudType.COMMERCIAL,
    displayName: 'New Zealand North',
    physicalLocation: 'Auckland',
    geography: 'New Zealand'
  },

  // India - Commercial
  'centralindia': {
    aliases: ['Central India', 'centralindia', 'pune', 'central india'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'southindia',
    displayName: 'Central India',
    physicalLocation: 'Pune',
    geography: 'India'
  },
  'southindia': {
    aliases: ['South India', 'southindia', 'chennai', 'south india'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'centralindia',
    displayName: 'South India',
    physicalLocation: 'Chennai',
    geography: 'India'
  },
  'westindia': {
    aliases: ['West India', 'westindia', 'mumbai', 'west india'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'southindia',
    displayName: 'West India',
    physicalLocation: 'Mumbai',
    geography: 'India'
  },

  // UAE - Commercial
  'uaecentral': {
    aliases: ['UAE Central', 'uaecentral', 'abu dhabi', 'uae central'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'uaenorth',
    displayName: 'UAE Central',
    physicalLocation: 'Abu Dhabi',
    geography: 'UAE'
  },
  'uaenorth': {
    aliases: ['UAE North', 'uaenorth', 'dubai', 'uae north'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'uaecentral',
    displayName: 'UAE North',
    physicalLocation: 'Dubai',
    geography: 'UAE'
  },

  // Qatar - Commercial
  'qatarcentral': {
    aliases: ['Qatar Central', 'qatarcentral', 'doha', 'qatar central'],
    cloudType: CloudType.COMMERCIAL,
    displayName: 'Qatar Central',
    physicalLocation: 'Doha',
    geography: 'Qatar'
  },

  // Israel - Commercial
  'israelcentral': {
    aliases: ['Israel Central', 'israelcentral', 'israel central'],
    cloudType: CloudType.COMMERCIAL,
    displayName: 'Israel Central',
    physicalLocation: 'Israel',
    geography: 'Israel'
  },

  // South Africa - Commercial
  'southafricanorth': {
    aliases: ['South Africa North', 'southafricanorth', 'johannesburg', 'south africa north'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'southafricawest',
    displayName: 'South Africa North',
    physicalLocation: 'Johannesburg',
    geography: 'South Africa'
  },
  'southafricawest': {
    aliases: ['South Africa West', 'southafricawest', 'cape town', 'south africa west'],
    cloudType: CloudType.COMMERCIAL,
    pairedRegion: 'southafricanorth',
    displayName: 'South Africa West',
    physicalLocation: 'Cape Town',
    geography: 'South Africa'
  },

  // Indonesia - Commercial
  'indonesiacentral': {
    aliases: ['Indonesia Central', 'indonesiacentral', 'jakarta', 'indonesia central'],
    cloudType: CloudType.COMMERCIAL,
    displayName: 'Indonesia Central',
    physicalLocation: 'Jakarta',
    geography: 'Indonesia'
  },

  // Malaysia - Commercial
  'malaysiawest': {
    aliases: ['Malaysia West', 'malaysiawest', 'malaysia west'],
    cloudType: CloudType.COMMERCIAL,
    displayName: 'Malaysia West',
    physicalLocation: 'Malaysia',
    geography: 'Malaysia'
  },


  // === AZURE GOVERNMENT CLOUD ===
  'usgovvirginia': {
    aliases: ['US Gov Virginia', 'usgovvirginia', 'usgov virginia', 'gov virginia', 'virginia gov'],
    cloudType: CloudType.GOVERNMENT,
    pairedRegion: 'usgovtexas',
    displayName: 'US Gov Virginia',
    physicalLocation: 'Virginia',
    geography: 'US Government'
  },
  'usgovtexas': {
    aliases: ['US Gov Texas', 'usgovtexas', 'usgov texas', 'gov texas', 'texas gov'],
    cloudType: CloudType.GOVERNMENT,
    pairedRegion: 'usgovvirginia',
    displayName: 'US Gov Texas',
    physicalLocation: 'Texas',
    geography: 'US Government'
  },
  'usgovarizona': {
    aliases: ['US Gov Arizona', 'usgovarizona', 'usgov arizona', 'gov arizona', 'arizona gov'],
    cloudType: CloudType.GOVERNMENT,
    pairedRegion: 'usgovtexas',
    displayName: 'US Gov Arizona',
    physicalLocation: 'Arizona',
    geography: 'US Government'
  },
  'usdodeast': {
    aliases: ['US DoD East', 'usdodeast', 'dod east', 'department of defense east'],
    cloudType: CloudType.GOVERNMENT,
    pairedRegion: 'usdodcentral',
    displayName: 'US DoD East',
    physicalLocation: 'US DoD East',
    geography: 'US Government'
  },
  'usdodcentral': {
    aliases: ['US DoD Central', 'usdodcentral', 'dod central', 'department of defense central'],
    cloudType: CloudType.GOVERNMENT,
    pairedRegion: 'usdodeast',
    displayName: 'US DoD Central',
    physicalLocation: 'US DoD Central',
    geography: 'US Government'
  },

  // === AZURE CHINA CLOUD (21Vianet) ===
  'chinaeast': {
    aliases: ['China East', 'chinaeast', 'china east'],
    cloudType: CloudType.CHINA,
    pairedRegion: 'chinanorth',
    displayName: 'China East',
    physicalLocation: 'China',
    geography: 'China'
  },
  'chinaeast2': {
    aliases: ['China East 2', 'chinaeast2', 'china east 2'],
    cloudType: CloudType.CHINA,
    pairedRegion: 'chinanorth2',
    displayName: 'China East 2',
    physicalLocation: 'China',
    geography: 'China'
  },
  'chinaeast3': {
    aliases: ['China East 3', 'chinaeast3', 'china east 3'],
    cloudType: CloudType.CHINA,
    pairedRegion: 'chinanorth3',
    displayName: 'China East 3',
    physicalLocation: 'China',
    geography: 'China'
  },
  'chinanorth': {
    aliases: ['China North', 'chinanorth', 'china north'],
    cloudType: CloudType.CHINA,
    pairedRegion: 'chinaeast',
    displayName: 'China North',
    physicalLocation: 'China',
    geography: 'China'
  },
  'chinanorth2': {
    aliases: ['China North 2', 'chinanorth2', 'china north 2'],
    cloudType: CloudType.CHINA,
    pairedRegion: 'chinaeast2',
    displayName: 'China North 2',
    physicalLocation: 'China',
    geography: 'China'
  },
  'chinanorth3': {
    aliases: ['China North 3', 'chinanorth3', 'china north 3'],
    cloudType: CloudType.CHINA,
    pairedRegion: 'chinaeast3',
    displayName: 'China North 3',
    physicalLocation: 'China',
    geography: 'China'
  },

  // === AZURE GERMANY CLOUD (Legacy) ===
  'germanycentral': {
    aliases: ['Germany Central', 'germanycentral', 'germany central', 'deutsche telekom'],
    cloudType: CloudType.GERMANY,
    pairedRegion: 'germanynortheast',
    displayName: 'Germany Central',
    physicalLocation: 'Frankfurt',
    geography: 'Germany (Data Trustee)'
  },
  'germanynortheast': {
    aliases: ['Germany Northeast', 'germanynortheast', 'germany northeast'],
    cloudType: CloudType.GERMANY,
    pairedRegion: 'germanycentral',
    displayName: 'Germany Northeast',
    physicalLocation: 'Magdeburg',
    geography: 'Germany (Data Trustee)'
  },

  // === GLOBAL/MULTI-REGION ===
  'global': {
    aliases: ['Global', 'global', 'worldwide', 'all regions', 'multi-region'],
    cloudType: CloudType.COMMERCIAL,
    displayName: 'Global',
    physicalLocation: 'Worldwide',
    geography: 'Global'
  }
}

// Normalize resource type for comparison
export function normalizeResourceType(resourceType: string): string {
  return resourceType.toLowerCase().replace(/[^a-z0-9./]/g, '')
}

// Normalize region for comparison
export function normalizeRegion(region: string): string {
  return region.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
}

// Get service names for a resource type
export function getServiceNamesForResourceType(resourceType: string): string[] {
  const normalized = normalizeResourceType(resourceType)
  const mapping = AZURE_SERVICE_MAPPINGS[normalized]
  return mapping ? mapping.rssNames : []
}

// Get mapping confidence weight
export function getMappingWeight(resourceType: string): number {
  const normalized = normalizeResourceType(resourceType)
  const mapping = AZURE_SERVICE_MAPPINGS[normalized]
  return mapping ? mapping.weight : 0.1 // Low default weight for unmapped types
}

// Check if regions match using canonical aliases
export function areRegionsMatching(csvRegion: string, rssRegion: string): boolean {
  const normalizedCsv = normalizeRegion(csvRegion)
  const normalizedRss = normalizeRegion(rssRegion)

  // Direct match
  if (normalizedCsv === normalizedRss) return true

  // Check region mappings
  for (const [key, mapping] of Object.entries(REGION_MAPPINGS)) {
    const normalizedAliases = mapping.aliases.map(normalizeRegion)
    const normalizedKey = normalizeRegion(key)

    const csvInRegion = normalizedAliases.includes(normalizedCsv) || normalizedKey === normalizedCsv
    const rssInRegion = normalizedAliases.includes(normalizedRss) || normalizedKey === normalizedRss

    if (csvInRegion && rssInRegion) {
      return true
    }
  }

  return false
}
