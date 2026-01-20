import { validateCem } from "../dist/index.js";
import manifest from './webawesome-cem.json' with { type: 'json' };

validateCem(manifest);