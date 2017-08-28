import ApolloClient, {createNetworkInterface} from 'apollo-client';
import { SubscriptionClient } from 'subscriptions-transport-ws';
//import config from './config';


function addGraphQLSubscriptions(networkInterface, wsClient) {
  return Object.assign(networkInterface, {
    subscribe(request, handler) {
      return wsClient.subscribe({
        query: print(request.query),
        variables: request.variables,
      }, handler);
    },
    unsubscribe(id) {
      wsClient.unsubscribe(id);
    },
  });
}

// creates a subscription ready Apollo Client instance

const scapholdUrl = 'us-west-2.api.scaphold.io/graphql/rendact-fork';
const graphqlUrl = `https://${scapholdUrl}`;
const websocketUrl = `wss://${scapholdUrl}`;
const networkInterface = createNetworkInterface({
    uri: graphqlUrl
});
networkInterface.use([{
  applyMiddleware(req, next) {
    // Easy way to add authorization headers for every request
    if (!req.options.headers) {
      req.options.headers = {};  // Create the header object if needed.
    }
    if (localStorage.getItem('token')) {
      // This is how to authorize users using http auth headers
      req.options.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    }
    next();
  },
}]);
const wsClient = new SubscriptionClient(websocketUrl);
const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(networkInterface, wsClient);

const clientGraphql = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  initialState: {},
});

export default clientGraphql;
