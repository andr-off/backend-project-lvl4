import i18next from 'i18next';
import buildFormObj from '../lib/formObjectBuilder';
import { normalizeName } from '../lib/normilazer';
import requiredAuthentication from '../middlewares/authentication.middleware';

export default (router, container) => {
  router
    .get('tags', '/tags', requiredAuthentication, async (ctx) => {
      const { Tag } = container.db;

      const tags = await Tag.findAll();
      await ctx.render('tags', { tags });
    })

    .get('newTag', '/tags/new', requiredAuthentication, async (ctx) => {
      const { Tag } = container.db;

      const tag = Tag.build();
      await ctx.render('tags/new', { f: buildFormObj(tag) });
    })

    .get('editTag', '/tags/:id/edit', requiredAuthentication, async (ctx) => {
      const { Tag } = container.db;
      const { id } = ctx.params;
      const tag = await Tag.findByPk(id);

      if (!tag) {
        throw new container.errors.NotFoundError();
      }

      await ctx.render('tags/edit', { f: buildFormObj(tag), tag });
    })

    .post('/tags', requiredAuthentication, async (ctx) => {
      const { Tag } = container.db;
      const { request: { body: { form } } } = ctx;

      form.name = normalizeName(form.name);

      const tag = Tag.build(form);

      try {
        await tag.save();
        ctx.flash('info', i18next.t('flash.tags.create.success'));
        ctx.redirect(router.url('tags'));
      } catch (e) {
        ctx.status = 422;
        ctx.flash('error', i18next.t('flash.tags.create.error'));
        await ctx.render('tags/new', { f: buildFormObj(tag, e) });
      }
    })

    .patch('tag', '/tags/:id', requiredAuthentication, async (ctx) => {
      const { Tag } = container.db;
      const { id } = ctx.params;
      const { request: { body: { form } } } = ctx;

      const tag = await Tag.findByPk(id);

      if (!tag) {
        throw new container.errors.NotFoundError();
      }

      form.name = normalizeName(form.name);

      try {
        await tag.update(form);
        ctx.flash('info', i18next.t('flash.tags.patch.success'));
        ctx.redirect(router.url('tags'));
      } catch (e) {
        ctx.status = 422;
        ctx.flash('error', i18next.t('flash.tags.patch.error'));
        await ctx.render('tags/new', { f: buildFormObj(tag, e) });
      }
    })

    .delete('/tags/:id', requiredAuthentication, async (ctx) => {
      const { Tag } = container.db;
      const { id } = ctx.params;

      const tag = await Tag.findByPk(id);

      if (!tag) {
        throw new container.errors.NotFoundError();
      }

      try {
        await tag.destroy();

        ctx.flash('info', i18next.t('flash.tags.delete.success'));
        ctx.redirect(router.url('tags'));
      } catch (e) {
        ctx.flash('error', i18next.t('flash.tags.delete.error'));
        ctx.redirect(router.url('tags'));
      }
    });
};
