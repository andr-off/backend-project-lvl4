import buildFormObj from '../lib/formObjectBuilder';
import { normalizeName } from '../lib/normilazer';
import db from '../models';
import requiredAuthentication from '../middlewares/authentication.middleware';

const { Tag } = db;

export default (router, container) => {
  router
    .get('tags', '/tags', async (ctx) => {
      const tags = await Tag.findAll();
      await ctx.render('tags', { tags });
    })

    .get('newTag', '/tags/new', async (ctx) => {
      const tag = Tag.build();
      await ctx.render('tags/new', { f: buildFormObj(tag) });
    })

    .get('editTag', '/tags/:id/edit', async (ctx) => {
      const { id } = ctx.params;
      const tag = await Tag.findByPk(id);

      if (!tag) {
        throw new container.errors.NotFoundError();
      }

      await ctx.render('tags/edit', { f: buildFormObj(tag), tag });
    })

    .post('/tags', requiredAuthentication, async (ctx) => {
      const { request: { body: { form } } } = ctx;

      form.name = normalizeName(form.name);

      const tag = Tag.build(form);

      try {
        await tag.save();
        ctx.flash.set('Tag has been created');
        ctx.redirect(router.url('tags'));
      } catch (e) {
        ctx.status = 422;
        await ctx.render('tags/new', { f: buildFormObj(tag, e) });
      }
    })

    .patch('tag', '/tags/:id', requiredAuthentication, async (ctx) => {
      const { id } = ctx.params;
      const { request: { body: { form } } } = ctx;
      const tag = await Tag.findByPk(id);

      if (!tag) {
        throw new container.errors.NotFoundError();
      }

      form.name = normalizeName(form.name);

      try {
        await tag.update(form);
        ctx.flash.set('Tag name has been updated');
        ctx.redirect(router.url('tags'));
      } catch (e) {
        ctx.status = 422;
        await ctx.render('tags/new', { f: buildFormObj(tag, e) });
      }
    })

    .delete('/tags/:id', requiredAuthentication, async (ctx) => {
      const { id } = ctx.params;
      const tag = await Tag.findByPk(id);

      if (!tag) {
        throw new container.errors.NotFoundError();
      }

      await tag.destroy();

      ctx.flash.set('Tag has been deleted');
      ctx.redirect(router.url('tags'));
    });
};
