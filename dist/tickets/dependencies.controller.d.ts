import { DependenciesService } from './dependencies.service';
declare class AddDependencyDto {
    blockedBy: number;
}
export declare class DependenciesController {
    private readonly depsService;
    constructor(depsService: DependenciesService);
    add(ticketId: number, dto: AddDependencyDto): Promise<import("./ticket-dependency.entity").TicketDependency>;
    list(ticketId: number): Promise<import("./ticket.entity").Ticket[]>;
    remove(ticketId: number, blockerId: number): Promise<void>;
}
export {};
