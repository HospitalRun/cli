"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const path_1 = __importDefault(require("path"));
const mkdirp_1 = __importDefault(require("mkdirp"));
const chalk_1 = __importDefault(require("chalk"));
const typebox_1 = require("@sinclair/typebox");
const ajv_1 = __importDefault(require("ajv"));
const ajv = new ajv_1.default({});
const writeFile = util_1.default.promisify(fs_1.default.writeFile);
const readFIle = util_1.default.promisify(fs_1.default.readFile);
const FORMATS = ['js', 'json', 'ts'];
const ViewsSchema = typebox_1.Type.Object({
    map: typebox_1.Type.Optional(typebox_1.Type.String()),
    reduce: typebox_1.Type.Optional(typebox_1.Type.String()),
});
const MapSchema = typebox_1.Type.Map(typebox_1.Type.String());
const DesignDocumentSchema = typebox_1.Type.Object({
    _id: typebox_1.Type.Optional(typebox_1.Type.String()),
    _rev: typebox_1.Type.Optional(typebox_1.Type.String()),
    language: typebox_1.Type.Optional(typebox_1.Type.String()),
    autoupdate: typebox_1.Type.Optional(typebox_1.Type.Boolean()),
    options: typebox_1.Type.Optional(typebox_1.Type.Object({
        local_seq: typebox_1.Type.Optional(typebox_1.Type.Boolean()),
        include_design: typebox_1.Type.Optional(typebox_1.Type.Boolean()),
    })),
    views: typebox_1.Type.Optional(typebox_1.Type.Map(ViewsSchema)),
    updates: typebox_1.Type.Optional(MapSchema),
    filters: typebox_1.Type.Optional(MapSchema),
    validate_doc_update: typebox_1.Type.Optional(typebox_1.Type.String()),
    shows: typebox_1.Type.Optional(MapSchema),
    lists: typebox_1.Type.Optional(MapSchema),
    rewrites: typebox_1.Type.Optional(typebox_1.Type.String()),
});
async function default_1(src, opts) {
    var _a;
    const methods = new Map();
    try {
        if (!FORMATS.includes(opts.format)) {
            throw Error(`Wrong destination format provided ${opts.format}, must be one of ${FORMATS}`);
        }
        const srcPath = path_1.default.resolve(src);
        const dbBackup = (await readFIle(srcPath)).toString();
        if (!opts.noVerbose) {
            console.log(`> ${chalk_1.default.bgBlueBright(chalk_1.default.black(' ddoc extract src '))} ${chalk_1.default.cyan(srcPath)}`);
        }
        const main = JSON.parse(dbBackup.replace(/\]\n\[/g, ','));
        const designDocuments = main.filter(doc => doc._id.startsWith('_design/'));
        const stats = {
            views: 0,
            updates: 0,
            filters: 0,
            validate_doc_update: 0,
            shows: 0,
            lists: 0,
            rewrites: 0,
        };
        if (opts.format === 'json') {
            for (const doc of designDocuments) {
                ajv.validate(DesignDocumentSchema, doc);
                stats.views = stats.views + (doc.views ? 1 : 0);
                stats.updates = stats.updates + (doc.updates ? 1 : 0);
                stats.filters = stats.filters + (doc.filters ? 1 : 0);
                stats.validate_doc_update = stats.validate_doc_update + (doc.validate_doc_update ? 1 : 0);
                stats.shows = stats.shows + (doc.shows ? 1 : 0);
                stats.lists = stats.lists + (doc.lists ? 1 : 0);
                stats.rewrites = stats.rewrites + (doc.rewrites ? 1 : 0);
            }
            const filename = `${path_1.default.basename(src, path_1.default.extname(src))}-designs.${opts.format}`;
            const dest = path_1.default.resolve(path_1.default.join(opts.destination, filename));
            if (!opts.noVerbose) {
                console.log(`> ${chalk_1.default.bgBlueBright(chalk_1.default.black(' ddoc extract designs found '))}`);
                console.table(stats);
            }
            await mkdirp_1.default(path_1.default.dirname(dest));
            if (!opts.noVerbose) {
                console.log(`> ${chalk_1.default.bgGreenBright(chalk_1.default.black(' ddoc extract destination '))} ${chalk_1.default.cyan(dest)}`);
            }
            await writeFile(dest, JSON.stringify(designDocuments, null, 1));
        }
        else {
            for (const doc of designDocuments) {
                if (!ajv.validate(DesignDocumentSchema, doc)) {
                    throw Error(`The ${doc._id}-${doc._rev} schema is invalid.`);
                }
                if (doc.views) {
                    stats.views = stats.views + 1;
                    for (const view of Object.keys(doc.views)) {
                        if (doc.views[view].map) {
                            const name = `${doc._id}-${doc._rev}.views.${view}.map`;
                            methods.set(name, doc.views[view].map);
                            doc.views[view].map = name;
                        }
                        if (doc.views[view].reduce) {
                            const name = `${doc._id}-${doc._rev}.views.${view}.reduce`;
                            methods.set(name, doc.views[view].reduce);
                            doc.views[view].reduce = name;
                        }
                    }
                }
                if (doc.updates) {
                    stats.updates = stats.updates + 1;
                    for (const update of Object.keys(doc.updates)) {
                        const name = `${doc._id}-${doc._rev}.updates.${update}`;
                        methods.set(name, doc.updates[update]);
                        doc.updates[update] = name;
                    }
                }
                if (doc.filters) {
                    stats.filters = stats.filters + 1;
                    for (const filter of Object.keys(doc.filters)) {
                        const name = `${doc._id}-${doc._rev}.filters.${filter}`;
                        methods.set(name, doc.filters[filter]);
                        doc.filters[filter] = name;
                    }
                }
                if (doc.validate_doc_update) {
                    stats.validate_doc_update = stats.validate_doc_update + 1;
                    const name = `${doc._id}-${doc._rev}.validate_doc_update`;
                    methods.set(name, doc.validate_doc_update);
                    doc.validate_doc_update = name;
                }
                if (doc.shows) {
                    stats.shows = stats.shows + 1;
                    for (const show of Object.keys(doc.shows)) {
                        const name = `${doc._id}-${doc._rev}.shows.${show}`;
                        methods.set(name, doc.shows[show]);
                        doc.shows[show] = name;
                    }
                }
                if (doc.lists) {
                    stats.lists = stats.lists + 1;
                    for (const list of Object.keys(doc.lists)) {
                        const name = `${doc._id}-${doc._rev}.lists.${list}`;
                        methods.set(name, doc.lists[list]);
                        doc.lists[list] = name;
                    }
                }
                if (doc.rewrites) {
                    stats.rewrites = stats.rewrites + 1;
                    const name = `${doc._id}-${doc._rev}.rewrites`;
                    methods.set(name, doc.rewrites);
                    doc.rewrites = name;
                }
            }
            if (!opts.noVerbose) {
                console.log(`> ${chalk_1.default.bgBlueBright(chalk_1.default.black(' ddoc extract designs creating destination folder '))}`);
            }
            const destFolder = path_1.default.resolve(path_1.default.join(opts.destination, `${path_1.default.basename(src, path_1.default.extname(src))}-designs`));
            await mkdirp_1.default(destFolder);
            for (const doc of designDocuments) {
                const filename = `${(_a = doc._id) === null || _a === void 0 ? void 0 : _a.split('_design/')[1]}-${doc._rev}.${opts.format === 'js' ? 'js' : 'ts'}`;
                if (!opts.noVerbose) {
                    console.log(`> ${chalk_1.default.bgBlueBright(chalk_1.default.black(` ddoc extract designs creating ${filename} `))}`);
                }
                const dest = path_1.default.resolve(path_1.default.join(destFolder, filename));
                let docString = opts.format === 'js'
                    ? `module.exports = ${JSON.stringify(doc, null, 1)}`
                    : `export default ${JSON.stringify(doc, null, 1)}`;
                for (const [name, method] of methods) {
                    docString = docString.replace(`\"${name}\"`, method);
                }
                await writeFile(dest, docString);
            }
            if (!opts.noVerbose) {
                console.log(`> ${chalk_1.default.bgGreenBright(chalk_1.default.black(' ddoc extract designs done '))}`);
                console.table(stats);
            }
        }
    }
    catch (err) {
        console.error(chalk_1.default.bgRed(chalk_1.default.white(` ${err.message} `)));
        process.exit(1);
    }
}
exports.default = default_1;
