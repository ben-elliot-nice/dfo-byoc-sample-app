# BYOC Connector Sample App

What we need

- NGrok set up and working for reverse proxy connections



## Resources Used
- https://github.com/mikan3rd/nest-next-sample/tree/main
- https://github.com/abodelot/jquery.json-viewer

## Talk To
- Vincent
- Hugh Smith (CXone Agent)



## Mission statement for refactor
- Controllers should handle http responsibility
  - Take a DTO validate it (handled automatically)
  - Call relevant services
  - Exception Filter should manage handling Error type to Http status exception and log any errors not pre-mapped
  - Construct Response DTO for return to user.
- Services should handle only the business logic of pulling together backend systems, not any HTTP stuff.
- Everything should be tested.