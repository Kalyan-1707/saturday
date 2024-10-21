<a href="https://livekit.io/">
  <img src="https://d112y698adiu2z.cloudfront.net/photos/production/software_thumbnail_photos/003/087/236/datas/medium.jpg" alt="Project saturday" width="100%">
</a>

# Project Saturday

SATURDAY: Smart Support, Anytime, Anywhere

## Dev Setup

Clone the repository and install dependencies:

```bash
npm install
```

Set up the environment by copying `.env.example` to `.env.local` and filling in the required values:

- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `OPENAI_API_KEY`
- `PINECONE_API_KEY`

To run the agent, first build the TypeScript project, then execute the output with the `dev` or `start` commands:
    
```bash
npm run build
node dist/agent.js dev # see agents-js for more info on subcommands
```

This agent requires a frontend application to communicate with. You can use one of our example frontends in [livekit-examples](https://github.com/livekit-examples/), create your own following one of our [client quickstarts](https://docs.livekit.io/realtime/quickstarts/), or test instantly against one of our hosted [Sandbox](https://cloud.livekit.io/projects/p_/sandbox) frontends.


## References
* Devpost - https://devpost.com/software/saturday

* Demo - https://youtu.be/kg_dBA6QMaM

  <video src="https://youtu.be/kg_dBA6QMaM" controls>
  