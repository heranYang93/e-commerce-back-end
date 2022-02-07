const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

// The `/api/tags` endpoint

router.get("/", async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findAll({
      include: [{ model: Product }],
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product }],
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", (req, res) => {
  // create a new tag
  /* req.body should look like this...
    {
      "tag_name":"A new tag"
      "productIds":[4,5]
    }
  */
  Tag.create(req.body)
    .then((data) => {
      if (req.body.productIds.length) {
        const productTagIdArr = req.body.productIds.map((singleProductId) => {
          return {
            product_id: singleProductId,
            tag_id: data.id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.put("/:id", (req, res) => {
  // update a tag's name by its `id` value
  /* req.body should look like this...
    {
      "tag_name":"A new tag"
      "productIds":[4,5]<=these are the new products which should be placed under this tag
    }
  */

  //update Tag itself
  Tag.update(req.body, { where: { id: req.params.id } })
    //update link
    .then(() => {
      ProductTag.destroy({ where: { tag_id: req.params.id } });
      if (req.body.productIds.length) {
        const newLinkArr = req.body.productIds.map((singleProductId) => {
          return {
            product_id: singleProductId,
            tag_id: req.params.id,
          };
        });
        Promise.resolve(ProductTag.bulkCreate(newLinkArr));
      }
    })
    .then((updatedLinks) => res.json(updatedLinks))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.delete("/:id", async (req, res) => {
  // delete on tag by its `id` value
  try {
    const tagData = await Tag.destroy({
      where: { id: req.params.id },
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
