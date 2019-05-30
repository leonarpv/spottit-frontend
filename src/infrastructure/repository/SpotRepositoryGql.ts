import { loader } from "graphql.macro";

import { SpotRepository } from "../../domain/repository/SpotRepository";
import { Spot, CreateSpotCommand } from "../../domain/model/Spot";
import { Location } from "../../domain/model/Location";
import { GraphQlService } from "../services/Graphql";
import {
  FetchSpot,
  FetchSpotVariables
} from "./queries/__generated__/FetchSpot";
import {
  SearchSpotsVariables,
  SearchSpots
} from "./queries/__generated__/SearchSpots";
import {
  CreateSpotVariables,
  CreateSpot
} from "./queries/__generated__/createSpot";

export const queries = {
  SPOT: loader("./queries/spot.graphql"),
  SEARCH_SPOT: loader("./queries/search-spots.graphql"),
  CREATE_SPOT: loader("./queries/create-spot.graphql")
};

interface Dependencies {
  graphqlService: GraphQlService;
}

export class SpotRepositoryGql implements SpotRepository {
  private graphql: GraphQlService;

  public constructor({ graphqlService }: Dependencies) {
    this.graphql = graphqlService;
  }

  public getSpot(id: string): Promise<Spot> {
    return this.graphql
      .query<FetchSpotVariables, FetchSpot>(queries.SPOT, {
        id
      })
      .then(response => response.spot);
  }

  public getSpotsByLocation(
    location: Location,
    radius: number
  ): Promise<Spot[]> {
    return this.graphql
      .query<SearchSpotsVariables, SearchSpots>(queries.SEARCH_SPOT, {
        latitude: location.latitude,
        longitude: location.longitude,
        radius
      })
      .then(response => response.spots);
  }

  public createSpot(createSpot: CreateSpotCommand) {
    return this.graphql
      .mutate<CreateSpotVariables, CreateSpot>(queries.CREATE_SPOT, {
        description: createSpot.description,
        latitude: createSpot.location.latitude,
        longitude: createSpot.location.longitude,
        name: createSpot.name
      })
      .then(response => response.createSpot);
  }
}