import mongoose from 'mongoose';
import Manga, { IManga } from '../models/Manga';
import MangaSeries, { IMangaSeries } from '../models/MangaSeries';

export type MangaSeriesFields = Pick<IMangaSeries,
    'title' | 'author' | 'genre' | 'description' | 'publishedYear' | 'status' | 'malScore' | 'malId' | 'mangaDexId' | 'alternativeTitles'
>;

export const makeSeriesKey = (title: string): string => title.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 240);

export const resolveMangaSeries = async (fields: Partial<MangaSeriesFields> & Pick<MangaSeriesFields, 'title' | 'author' | 'genre'>) => {
    const seriesKey = makeSeriesKey(fields.title);
    if (!seriesKey) throw new Error('A series title is required');
    const setOnInsert: Record<string, unknown> = {
        title: fields.title.trim(), author: fields.author.trim(), genre: fields.genre.trim()
    };
    for (const key of ['description', 'publishedYear', 'status', 'malScore', 'malId', 'mangaDexId'] as const) {
        if (fields[key] !== undefined) setOnInsert[key] = fields[key];
    }
    if (fields.alternativeTitles !== undefined) setOnInsert.alternativeTitles = fields.alternativeTitles;
    return MangaSeries.findOneAndUpdate({ seriesKey }, { $setOnInsert: { ...setOnInsert, seriesKey } }, { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true });
};

export const serializeManga = (document: IManga): Record<string, unknown> => {
    const volume = document.toObject({ virtuals: false, transform: false }) as unknown as Record<string, unknown>;
    const candidate = volume.series;
    const series = candidate && typeof candidate === 'object' && '_id' in candidate
        ? candidate as Record<string, unknown>
        : null;
    const volumeId = volume._id;
    const seriesId = series?._id ?? candidate;
    const { series: _series, ...volumeFields } = volume;
    return {
        ...(series || {}),
        ...volumeFields,
        _id: volumeId,
        seriesId: seriesId instanceof mongoose.Types.ObjectId ? seriesId.toString() : seriesId,
        series: seriesId
    };
};

export const serializeMangas = (documents: IManga[]): Record<string, unknown>[] => documents.map(serializeManga);

export const loadSeriesForVolumeIds = async (volumeIds: mongoose.Types.ObjectId[]) => {
    const volumes = await Manga.find({ _id: { $in: volumeIds } }).populate('series');
    const byId = new Map(volumes.map(volume => [volume._id.toString(), serializeManga(volume)]));
    return volumeIds.map(id => byId.get(id.toString())).filter((volume): volume is Record<string, unknown> => Boolean(volume));
};
