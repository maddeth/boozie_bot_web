import { TableClient, AzureSASCredential, AzureNamedKeyCredential } from "@azure/data-tables"
import { InteractiveBrowserCredential } from "@azure/identity";

const account = import.meta.env.VITE_AZURE_TABLE_ACCOUNT
const accountKey = import.meta.env.VITE_AZURE_TABLE_ACCOUNT_KEY

const sas = import.meta.env.VITE_AZURE_STORAGE_SAS
const azureTableEndpoint = `https://${account}.table.core.windows.net`;
const colourTableName = "colours";
const colourTableClient = new TableClient(azureTableEndpoint, colourTableName, new AzureSASCredential(sas));

export let coloursRowCount = parseInt(await getRowCount(colourTableClient), 10)

async function getRowCount(tableClient) {
    let rowList = []
    let entities = tableClient.listEntities();
    for await (const entity of entities) {
        rowList.push(entity.RowKey)
    }
    return rowList.length
}